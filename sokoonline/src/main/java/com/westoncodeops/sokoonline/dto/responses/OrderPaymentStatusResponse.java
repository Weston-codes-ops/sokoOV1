package com.westoncodeops.sokoonline.dto.responses;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderPaymentStatusResponse(
        UUID orderId,
        String orderStatus,
        String paymentStatus,
        BigDecimal amount,
        String receiptNumber,
        String message,
        LocalDateTime updatedAt) {
}
