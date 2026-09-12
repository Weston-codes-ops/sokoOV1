package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.responses.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse getCart(UUID userId);
    CartResponse addItem(UUID userId, UUID productId, Integer quantity);
    CartResponse updateItemQuantity(UUID userId, UUID productId, Integer quantity);
    CartResponse removeItem(UUID userId, UUID productId);
    CartResponse clearCart(UUID userId);
}
