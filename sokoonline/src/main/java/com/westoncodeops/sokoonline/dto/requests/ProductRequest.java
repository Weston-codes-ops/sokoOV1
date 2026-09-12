package com.westoncodeops.sokoonline.dto.requests;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(@NotBlank(message = "Name is required")
                             String name,
                             @NotBlank(message = "Description is required")
                             String description,
                             @Min(value = 0, message = "Stock must be >= 0")
                             Integer stockQuantity,
                             @DecimalMin(value = "0.0", inclusive = false, message = "Price must be > 0")
                             BigDecimal price,
                             String imageURL,
                             List<String> categories,
                             List<String> subcategories) {
}
