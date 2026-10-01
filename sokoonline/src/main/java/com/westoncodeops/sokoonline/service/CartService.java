package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.responses.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse getCart(UUID customerId);
    CartResponse addItem(UUID customerId, UUID productId, Integer quantity);
    CartResponse updateItemQuantity(UUID customerId, UUID productId, Integer quantity);
    CartResponse removeItem(UUID customerId, UUID productId);
    CartResponse clearCart(UUID customerId);
}
