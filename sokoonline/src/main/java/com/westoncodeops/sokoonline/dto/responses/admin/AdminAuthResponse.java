package com.westoncodeops.sokoonline.dto.responses.admin;

public record AdminAuthResponse(String token,
                                String email,
                                String refreshToken) {
}
