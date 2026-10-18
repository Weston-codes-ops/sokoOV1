package com.westoncodeops.sokoonline.service.payment;

import com.westoncodeops.sokoonline.dto.requests.CheckoutRequest;
import com.westoncodeops.sokoonline.dto.responses.CheckoutResponse;
import com.westoncodeops.sokoonline.dto.responses.OrderPaymentStatusResponse;
import com.westoncodeops.sokoonline.entities.PaymentAttempt;
import com.westoncodeops.sokoonline.enums.PaymentStatus;
import com.westoncodeops.sokoonline.exceptions.InsufficientStockException;
import com.westoncodeops.sokoonline.exceptions.PaymentGatewayException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.PaymentAttemptRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CheckoutService {

    private final DarajaClient darajaClient;
    private final OrderService orderService;
    private final PaymentAttemptRepository paymentAttemptRepository;

    public CheckoutService(
            DarajaClient darajaClient,
            OrderService orderService,
            PaymentAttemptRepository paymentAttemptRepository) {
        this.darajaClient = darajaClient;
        this.orderService = orderService;
        this.paymentAttemptRepository = paymentAttemptRepository;
    }

    public CheckoutResponse beginCheckout(UUID customerId, CheckoutRequest request) {
        darajaClient.validateConfiguration();
        PendingOrder pendingOrder = orderService.createPendingOrder(customerId, request);

        DarajaStkPushResult result;
        try {
            result = darajaClient.requestStkPush(
                    pendingOrder.phoneNumber(),
                    pendingOrder.amount(),
                    pendingOrder.orderId().toString().substring(0, 8));
        } catch (PaymentGatewayException ex) {
            orderService.markInitiationFailed(pendingOrder.paymentAttemptId(), ex.getMessage());
            throw ex;
        }

        orderService.recordStkPushAccepted(
                pendingOrder.paymentAttemptId(),
                result.merchantRequestId(),
                result.checkoutRequestId(),
                result.customerMessage());
        return new CheckoutResponse(
                pendingOrder.orderId(),
                PaymentStatus.PENDING.name(),
                pendingOrder.amount(),
                result.customerMessage());
    }

    public OrderPaymentStatusResponse getOrderStatus(UUID customerId, UUID orderId) {
        return orderService.getOrderStatus(customerId, orderId);
    }

    public boolean isValidCallbackSecret(String candidate) {
        return darajaClient.isValidCallbackSecret(candidate);
    }

    public void processCallback(JsonNode stkCallback) {
        String checkoutRequestId = stkCallback.path("CheckoutRequestID").asText(null);
        int resultCode = stkCallback.path("ResultCode").asInt(-1);
        String resultDescription = stkCallback.path("ResultDesc").asText("No result description");

        if (checkoutRequestId == null || checkoutRequestId.isBlank()) {
            throw new IllegalArgumentException("Daraja callback did not include a CheckoutRequestID.");
        }

        PaymentAttempt attempt = paymentAttemptRepository.findByCheckoutRequestId(checkoutRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment attempt not found."));
        if (attempt.getStatus() != PaymentStatus.PENDING) {
            return;
        }

        if (resultCode != 0) {
            orderService.recordFailedPayment(attempt.getId(), resultCode, resultDescription);
            return;
        }

        JsonNode metadataItems = stkCallback.path("CallbackMetadata").path("Item");
        BigDecimal callbackAmount = null;
        String receiptNumber = null;
        for (JsonNode item : metadataItems) {
            String name = item.path("Name").asText();
            if ("Amount".equals(name) && item.hasNonNull("Value")) {
                callbackAmount = item.path("Value").decimalValue();
            } else if ("MpesaReceiptNumber".equals(name)) {
                receiptNumber = item.path("Value").asText(null);
            }
        }

        if (callbackAmount == null || callbackAmount.compareTo(attempt.getAmount()) != 0
                || receiptNumber == null || receiptNumber.isBlank()) {
            orderService.recordPaymentVerificationIssue(
                    attempt.getId(), resultCode, "Daraja reported payment success, but the amount or receipt could not be verified.");
            return;
        }

        try {
            orderService.completeSuccessfulPayment(
                    attempt.getId(), resultCode, resultDescription, receiptNumber);
        } catch (InsufficientStockException ex) {
            orderService.recordPaidOrderStockFailure(
                    attempt.getId(), resultCode, receiptNumber, ex.getMessage());
        }
    }

}
