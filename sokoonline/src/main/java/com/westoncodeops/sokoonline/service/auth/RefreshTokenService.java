package com.westoncodeops.sokoonline.service.auth;

import com.westoncodeops.sokoonline.config.jwt.JwtService;
import com.westoncodeops.sokoonline.dto.responses.RefreshResponse;
import com.westoncodeops.sokoonline.entities.Auth.RefreshToken;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.entities.admin.Admin;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.exceptions.InvalidRefreshTokenException;
import com.westoncodeops.sokoonline.repositories.RefreshTokenRepository;
import com.westoncodeops.sokoonline.repositories.admin.AdminRepository;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    @Transactional
    public String issue(UserDetails user, UUID ownerId, AccountType ownerType) {
        String token = jwtService.generateRefreshToken(user, ownerType);
        refreshTokenRepository.save(RefreshToken.builder()
                .tokenHash(hash(token))
                .issuedAt(jwtService.extractIssuedAt(token))
                .expiresAt(jwtService.extractExpiration(token))
                .ownerId(ownerId)
                .ownerType(ownerType)
                .build());
        return token;
    }

    @Transactional
    public RefreshResponse refresh(String token, AccountType expectedType) {
        if (token == null || token.isBlank()) {
            throw invalidToken();
        }

        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHashAndRevokedAtIsNull(hash(token))
                .orElseThrow(this::invalidToken);

        if (storedToken.getOwnerType() != expectedType || !storedToken.getExpiresAt().isAfter(Instant.now())) {
            throw invalidToken();
        }

        UserDetails user;
        try {
            if (!"refresh".equals(jwtService.extractTokenType(token))) {
                throw invalidToken();
            }
            String username = jwtService.extractUserName(token);
            if (jwtService.extractAccountType(token) != storedToken.getOwnerType()) {
                throw invalidToken();
            }
            user = loadOwner(username, storedToken);
            if (!jwtService.isTokenValid(token, user)
                    || !jwtService.extractExpiration(token).equals(storedToken.getExpiresAt())) {
                throw invalidToken();
            }
        } catch (JwtException | IllegalArgumentException ex) {
            throw invalidToken();
        }

        Instant now = Instant.now();
        storedToken.setRevokedAt(now);
        refreshTokenRepository.save(storedToken);

        String accessToken = jwtService.generateAccessToken(user, storedToken.getOwnerType());
        String rotatedRefreshToken = issue(user, storedToken.getOwnerId(), storedToken.getOwnerType());
        return new RefreshResponse(accessToken, rotatedRefreshToken, storedToken.getOwnerType());
    }

    private UserDetails loadOwner(String username, RefreshToken token) {
        if (token.getOwnerType() == AccountType.USER) {
            Customer customer = customerRepository.findByEmail(username).orElseThrow(this::invalidToken);
            if (!customer.getId().equals(token.getOwnerId())) {
                throw invalidToken();
            }
            return customer;
        }

        Admin admin = adminRepository.findByEmail(username).orElseThrow(this::invalidToken);
        if (!admin.getId().equals(token.getOwnerId())) {
            throw invalidToken();
        }
        return admin;
    }

    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private InvalidRefreshTokenException invalidToken() {
        return new InvalidRefreshTokenException("Refresh token is invalid, expired, or revoked");
    }
}