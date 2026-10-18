package com.westoncodeops.sokoonline.controllers;

import com.westoncodeops.sokoonline.dto.requests.CheckoutRequest;
import com.westoncodeops.sokoonline.dto.responses.CheckoutResponse;
import com.westoncodeops.sokoonline.dto.responses.OrderPaymentStatusResponse;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.service.payment.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CheckoutController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutController.class);
    private final CheckoutService checkoutService;

    @PostMapping("/api/v1/checkout")
    public ResponseEntity<CheckoutResponse> beginCheckout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal Customer customer) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(checkoutService.beginCheckout(customer.getId(), request));
    }

    @GetMapping("/api/v1/checkout/{orderId}")
    public ResponseEntity<OrderPaymentStatusResponse> getPaymentStatus(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal Customer customer) {
        return ResponseEntity.ok(checkoutService.getOrderStatus(customer.getId(), orderId));
    }

    @PostMapping("/api/v1/payments/daraja/callback/{secret}")
    public ResponseEntity<Map<String, Object>> receiveDarajaCallback(
            @PathVariable String secret,
            @RequestBody JsonNode request) {
        if (!checkoutService.isValidCallbackSecret(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "ResultCode", 1,
                    "ResultDesc", "Invalid callback authorization"));
        }

        JsonNode stkCallback = request.path("Body").path("stkCallback");
        if (stkCallback.isMissingNode() || stkCallback.isNull()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ResultCode", 1,
                    "ResultDesc", "Invalid callback payload"));
        }

        try {
            checkoutService.processCallback(stkCallback);
        } catch (ResourceNotFoundException ex) {
            log.warn("Ignoring Daraja callback for an unknown checkout request.");
        }

        return ResponseEntity.ok(Map.of("ResultCode", 0, "ResultDesc", "Accepted"));
    }
}
