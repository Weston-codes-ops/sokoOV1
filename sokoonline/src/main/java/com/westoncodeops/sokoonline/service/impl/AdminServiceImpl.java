package com.westoncodeops.sokoonline.service.impl;

import com.westoncodeops.sokoonline.dto.requests.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.admin.AdminRegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.entities.Admin;
import com.westoncodeops.sokoonline.enums.Role;
import com.westoncodeops.sokoonline.exceptions.DuplicateResourceException;
import com.westoncodeops.sokoonline.exceptions.InvalidCredentialsException;
import com.westoncodeops.sokoonline.repositories.AdminRepository;
import com.westoncodeops.sokoonline.repositories.UserRepository;
import com.westoncodeops.sokoonline.security.jwt.JwtService;
import com.westoncodeops.sokoonline.service.AdminService;
import com.westoncodeops.sokoonline.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${admin.registration-key}")
    private String registrationKey;

    @Override
    @Transactional
    public AuthResponse register(AdminRegisterRequest request) {
        if (!isValidRegistrationKey(request.secretKey())) {
            throw new InvalidCredentialsException("Invalid admin registration key");
        }
        String email = normalize(request.email());
        if (adminRepository.existsByEmail(email) || userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }
        Admin admin = adminRepository.save(Admin.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.ADMIN)
                .build());
        return authenticate(admin, "Admin registration successful");
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(normalize(request.email()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        return authenticate(admin, "Admin login successful");
    }

    private AuthResponse authenticate(Admin admin, String message) {
        String accessToken = jwtService.generateAccessToken(admin);
        String refreshToken = refreshTokenService.issueRefreshToken(admin);
        return new AuthResponse(admin.getId(), admin.getEmail(),
                admin.getFirstName() + " " + admin.getLastName(), Role.ADMIN,
                message, accessToken, refreshToken);
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase();
    }

    private boolean isValidRegistrationKey(String submittedKey) {
        if (registrationKey == null || registrationKey.isBlank() || submittedKey == null) {
            return false;
        }
        return MessageDigest.isEqual(
                registrationKey.getBytes(StandardCharsets.UTF_8),
                submittedKey.getBytes(StandardCharsets.UTF_8));
    }
}