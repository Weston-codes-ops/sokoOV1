package com.westoncodeops.sokoonline.controllers.customers;


import com.westoncodeops.sokoonline.dto.requests.auth.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.auth.RegisterRequest;
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

@RestController
@RequestMapping("api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerAuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    @ApiResponses()
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request){
        AuthResponse created = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        return ResponseEntity.status(HttpStatus.OK).body(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(refreshTokenService.refresh(request.refreshToken(), AccountType.USER));
    }
}
