package com.westoncodeops.sokoonline.controllers;

import com.westoncodeops.sokoonline.dto.requests.CartItemRequest;
import com.westoncodeops.sokoonline.dto.responses.CartResponse;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Get the authenticated user's cart")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cart loaded"),
            @ApiResponse(responseCode = "401", description = "Requires authentication")
    })
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal Customer currentCustomer) {
        return ResponseEntity.ok(cartService.getCart(currentCustomer.getId()));
    }

    @Operation(summary = "Add a product line-item to cart, or merge quantity if already present")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item added, updated cart returned"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "422", description = "Not enough stock / product inactive")
    })
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@Valid @RequestBody CartItemRequest request, @AuthenticationPrincipal Customer currentCustomer) {
        UUID userId = currentCustomer.getId();
        return ResponseEntity.ok(cartService.addItem(userId, request.productId(), request.quantity()));
    }

    @Operation(summary = "Change the quantity of an existing line item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quantity updated"),
            @ApiResponse(responseCode = "404", description = "Product not in cart"),
            @ApiResponse(responseCode = "422", description = "Not enough stock")
    })
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @AuthenticationPrincipal Customer currentCustomer,
            @PathVariable UUID productId,
            @RequestParam Integer quantity) {
        UUID userId = currentCustomer.getId();
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, quantity));
    }

    @Operation(summary = "Remove a single line item by product ID")
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable UUID productId, @AuthenticationPrincipal Customer currentCustomer) {
        UUID userId = currentCustomer.getId();
        return ResponseEntity.ok(cartService.removeItem(userId, productId));
    }

    @Operation(summary = "Clear every item from the cart")
    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(@AuthenticationPrincipal Customer currentCustomer) {
        UUID userId = currentCustomer.getId();
        return ResponseEntity.ok(cartService.clearCart(userId));
    }
}
