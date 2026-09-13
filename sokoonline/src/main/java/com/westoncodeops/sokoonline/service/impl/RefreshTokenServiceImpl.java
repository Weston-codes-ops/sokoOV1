package com.westoncodeops.sokoonline.service.impl;

import com.westoncodeops.sokoonline.dto.requests.RefreshRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.entities.Auth.RefreshToken;
import com.westoncodeops.sokoonline.entities.User;
import com.westoncodeops.sokoonline.entities.Admin;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.enums.Role;
import com.westoncodeops.sokoonline.exceptions.InvalidRefreshTokenException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.RefreshTokenRepository;
import com.westoncodeops.sokoonline.repositories.UserRepository;
import com.westoncodeops.sokoonline.repositories.AdminRepository;
import com.westoncodeops.sokoonline.security.AccountPrincipal;
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
    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public String issueRefreshToken(AccountPrincipal account) {
        String rawToken = UUID.randomUUID().toString() + "-" + System.nanoTime();
        String tokenHash = sha256Hex(rawToken);
        Instant now = Instant.now();
        RefreshToken rt = RefreshToken.builder()
                .tokenHash(tokenHash)
                .ownerId(account.getId())
                .ownerType(account instanceof Admin ? AccountType.ADMIN : AccountType.USER)
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

        RefreshToken stored = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token is invalid or revoked"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevokedAt(Instant.now());
            refreshTokenRepository.save(stored);
            throw new InvalidRefreshTokenException("Refresh token is expired");
        }

        AccountPrincipal account = findAccount(stored);

        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        String newAccessToken = jwtService.generateAccessToken(account);
        String newRefreshToken = issueRefreshToken(account);

        String fullName = fullName(account);
        Role role = account.getRole();
        return new AuthResponse(
            account.getId(),
            account.getUsername(),
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
        RefreshToken rt = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash).orElse(null);
        if (rt != null && rt.getOwnerId().equals(userId)) {
            rt.setRevokedAt(Instant.now());
            refreshTokenRepository.save(rt);
        }
    }

    @Override
    @Transactional
    public void revokeAllRefreshTokensForUser(UUID userId) {
        List<RefreshToken> active = refreshTokenRepository.findAllByOwnerIdAndOwnerTypeAndRevokedAtIsNull(
            userId, AccountType.USER);
        active.addAll(refreshTokenRepository.findAllByOwnerIdAndOwnerTypeAndRevokedAtIsNull(
            userId, AccountType.ADMIN));
        Instant now = Instant.now();
        for (RefreshToken rt : active) {
            rt.setRevokedAt(now);
        }
        refreshTokenRepository.saveAll(active);
    }

    private AccountPrincipal findAccount(RefreshToken token) {
        if (token.getOwnerType() == AccountType.ADMIN) {
            return adminRepository.findById(token.getOwnerId())
                    .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token is invalid"));
        }
        return userRepository.findById(token.getOwnerId())
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token is invalid"));
    }

    private static String fullName(AccountPrincipal account) {
        if (account instanceof User user) {
            return user.getFirstName() + " " + user.getLastName();
        }
        Admin admin = (Admin) account;
        return admin.getFirstName() + " " + admin.getLastName();
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
