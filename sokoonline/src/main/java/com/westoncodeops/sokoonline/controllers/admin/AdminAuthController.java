package com.westoncodeops.sokoonline.controllers.admin;

import com.westoncodeops.sokoonline.dto.requests.RefreshRequest;
import com.westoncodeops.sokoonline.dto.requests.admin.AdminLoginRequest;
import com.westoncodeops.sokoonline.dto.requests.admin.AdminRegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.RefreshResponse;
import com.westoncodeops.sokoonline.dto.responses.admin.AdminAuthResponse;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.service.auth.RefreshTokenService;
import com.westoncodeops.sokoonline.service.auth.admins.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminService adminService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody AdminRegisterRequest request) {
        adminService.registerNewAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AdminAuthResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminService.loginAdmin(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(refreshTokenService.refresh(request.refreshToken(), AccountType.ADMIN));
    }
}