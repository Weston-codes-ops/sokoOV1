package com.westoncodeops.sokoonline.dto.responses;

import java.math.BigDecimal;
import java.util.UUID;

public record CheckoutResponse(
        UUID orderId,
        String paymentStatus,
        BigDecimal amount,
        String message) {
}
