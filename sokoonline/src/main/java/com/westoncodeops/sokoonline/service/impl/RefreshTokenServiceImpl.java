package com.westoncodeops.sokoonline.service.impl;

import com.westoncodeops.sokoonline.dto.requests.RefreshRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.entities.Auth.RefreshToken;
import com.westoncodeops.sokoonline.entities.User;
import com.westoncodeops.sokoonline.enums.Role;
import com.westoncodeops.sokoonline.exceptions.InvalidRefreshTokenException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.RefreshTokenRepository;
import com.westoncodeops.sokoonline.repositories.UserRepository;
import com.westoncodeops.sokoonline.security.jwt.JwtService;
import com.westoncodeops.sokoonline.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public String issueRefreshToken(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String rawToken = UUID.randomUUID().toString() + "-" + System.nanoTime();
        String tokenHash = sha256Hex(rawToken);
        Instant now = Instant.now();
        RefreshToken rt = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .issuedAt(now)
                .expiresAt(now.plusMillis(refreshTokenExpirationMs))
                .revokedAt(null)
                .build();
        refreshTokenRepository.save(rt);
        return rawToken;
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(RefreshRequest request) {
        String incomingToken = request.refreshToken();
        String hash = sha256Hex(incomingToken);

        RefreshToken stored = refreshTokenRepository.findActiveByHashWithUser(hash)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token is invalid or revoked"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevokedAt(Instant.now());
            refreshTokenRepository.save(stored);
            throw new InvalidRefreshTokenException("Refresh token is expired");
        }

        User user = stored.getUser();
        if (user == null) {
            throw new InvalidRefreshTokenException("Refresh token is invalid");
        }

        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = issueRefreshToken(user.getId());

        String fullName = user.getFirstName() + " " + user.getLastName();
        Role role = user.getRole();
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                fullName,
                role,
                "Token refreshed",
                newAccessToken,
                newRefreshToken
        );
    }

    @Override
    @Transactional
    public void revokeRefreshToken(UUID userId, String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        String hash = sha256Hex(token);
        RefreshToken rt = refreshTokenRepository.findActiveByHashWithUser(hash).orElse(null);
        if (rt != null && rt.getUser() != null && rt.getUser().getId().equals(userId)) {
            rt.setRevokedAt(Instant.now());
            refreshTokenRepository.save(rt);
        }
    }

    @Override
    @Transactional
    public void revokeAllRefreshTokensForUser(UUID userId) {
        List<RefreshToken> active = refreshTokenRepository.findAllActiveByUserId(userId);
        Instant now = Instant.now();
        for (RefreshToken rt : active) {
            rt.setRevokedAt(now);
        }
        refreshTokenRepository.saveAll(active);
    }

    private static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
