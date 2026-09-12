package com.westoncodeops.sokoonline.dto.responses;

import com.westoncodeops.sokoonline.enums.Role;

import java.util.UUID;

public record AuthResponse(UUID userId,
                           String email,
                           String fullName,
                           Role role,
                           String message,
                           String accessToken,
                           String refreshToken) {
}
