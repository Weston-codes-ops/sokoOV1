package com.westoncodeops.sokoonline.dto.responses;

import java.util.UUID;

public record AuthResponse(UUID userId,
                           String email,
                           String fullName,
                           String message,
                           String accessToken,
                           String refreshToken) {
}
