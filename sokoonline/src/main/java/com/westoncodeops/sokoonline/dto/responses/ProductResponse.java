package com.westoncodeops.sokoonline.dto.responses;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ProductResponse(UUID id,
                              String name,
                              String slug,
                              String description,
                              BigDecimal price,
                              Integer stockQuantity,
                              String imageURL,
                              Boolean isActive,
                              List<String> categories,
                              List<String> subcategories,
                              @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
                              LocalDateTime createdAt) {
}
