package com.westoncodeops.sokoonline.controllers.customers;


import com.westoncodeops.sokoonline.dto.requests.auth.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.auth.RegisterRequest;
import com.westoncodeops.sokoonline.dto.requests.auth.ResendVerificationRequest;
import com.westoncodeops.sokoonline.dto.requests.auth.VerifyEmailRequest;
import com.westoncodeops.sokoonline.dto.requests.RefreshRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.dto.responses.RefreshResponse;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.service.auth.customers.CustomerAuthService;
import com.westoncodeops.sokoonline.service.auth.RefreshTokenService;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerAuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    @ApiResponses()
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request){
        AuthResponse created = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.status(HttpStatus.OK).body(authService.login(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        AuthResponse verified = authService.verifyEmail(request.email(), request.code());
        if (verified == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "The verification code is invalid or expired. Request a new code and try again."));
        }
        return ResponseEntity.ok(verified);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.accepted().body(Map.of(
                "message", "If this account needs verification, a code will be sent when it can be issued."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(refreshTokenService.refresh(request.refreshToken(), AccountType.USER));
    }
}
