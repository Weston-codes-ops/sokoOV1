package com.westoncodeops.sokoonline.dto.responses;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(UUID cartId,
                           List<CartItemResponse> items,
                           BigDecimal totalAmount) {
}
