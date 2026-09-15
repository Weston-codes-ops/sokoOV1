package com.westoncodeops.sokoonline.dto.requests;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CategoryRequest(@NotBlank(message = "Category name is required") String name, UUID parentId) {
}
