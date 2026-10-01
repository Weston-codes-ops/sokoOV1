package com.westoncodeops.sokoonline.dto.responses;

import com.westoncodeops.sokoonline.enums.AccountType;

public record RefreshResponse(String accessToken,
                              String refreshToken,
                              AccountType accountType) {
}