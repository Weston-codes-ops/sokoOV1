package com.westoncodeops.sokoonline.service.payment;

import java.math.BigDecimal;
import java.util.UUID;

public record PendingOrder(
        UUID orderId,
        UUID paymentAttemptId,
        String phoneNumber,
        BigDecimal amount) {
}
