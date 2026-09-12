package com.westoncodeops.sokoonline.controllers;

import com.westoncodeops.sokoonline.dto.requests.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.RefreshRequest;
import com.westoncodeops.sokoonline.dto.requests.RegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.dto.responses.UserResponse;
import com.westoncodeops.sokoonline.security.CurrentUser;
import com.westoncodeops.sokoonline.service.RefreshTokenService;
import com.westoncodeops.sokoonline.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "Register a new customer account",
            description = "Creates a new USER-role account and provisions an empty shopping cart. " +
                    "Returns JWT access token (15 min) and a refresh token (7 days) in the response body. " +
                    "Public endpoint.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Account created"),
            @ApiResponse(responseCode = "400", description = "Validation failed / missing fields"),
            @ApiResponse(responseCode = "409", description = "Email already registered")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Log in with email + password",
            description = "Validates credentials and returns a short-lived JWT access token (15 min) " +
                    "plus a one-time-use refresh token (7 days, rotated on each /refresh call).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Credentials valid — JWT pair issued"),
            @ApiResponse(responseCode = "401", description = "Invalid email or password")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Exchange refresh token for a new JWT pair",
            description = "Refresh tokens are one-time-use only: the submitted token is revoked and a new " +
                    "refresh token is issued together with a fresh access token. If the supplied token has " +
                    "been previously used, the entire family is considered compromised and 401 is returned.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "New token pair issued"),
            @ApiResponse(responseCode = "401", description = "Refresh token invalid, expired, or revoked")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(refreshTokenService.refreshAccessToken(request));
    }

    @Operation(summary = "Log out (revoke current refresh token)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody(required = false) RefreshRequest body) {
        UUID userId = CurrentUser.idOrThrow();
        if (body != null && body.refreshToken() != null && !body.refreshToken().isBlank()) {
            refreshTokenService.revokeRefreshToken(userId, body.refreshToken());
        }
        refreshTokenService.revokeAllRefreshTokensForUser(userId);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @Operation(summary = "Get the currently authenticated user", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        UUID id = CurrentUser.idOrThrow();
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Get user by ID (ADMIN only)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Delete user by ID (ADMIN only)", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
