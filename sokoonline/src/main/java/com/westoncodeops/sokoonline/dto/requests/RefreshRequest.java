package com.westoncodeops.sokoonline.dto.requests;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank(message = "Refresh token is required")
                             String refreshToken) {
}
