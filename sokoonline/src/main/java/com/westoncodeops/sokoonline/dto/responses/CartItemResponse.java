package com.westoncodeops.sokoonline.dto.responses;

import java.math.BigDecimal;
import java.util.UUID;


public record CartItemResponse(UUID productId,
                               String productName,
                               String imageURL,
                               BigDecimal unitPrice,
                               Integer quantity,
                               BigDecimal subTotal) {
}
