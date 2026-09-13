package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.requests.RefreshRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.security.AccountPrincipal;

import java.util.UUID;

public interface RefreshTokenService {

    String issueRefreshToken(AccountPrincipal account);
    AuthResponse refreshAccessToken(RefreshRequest request);
    void revokeRefreshToken(UUID userId, String token);
    void revokeAllRefreshTokensForUser(UUID userId);
}
