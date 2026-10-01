package com.westoncodeops.sokoonline.service.auth.admins;

import com.westoncodeops.sokoonline.config.jwt.JwtService;
import com.westoncodeops.sokoonline.dto.requests.admin.AdminLoginRequest;
import com.westoncodeops.sokoonline.dto.requests.admin.AdminRegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.dto.responses.admin.AdminAuthResponse;
import com.westoncodeops.sokoonline.entities.admin.Admin;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.exceptions.DuplicateResourceException;
import com.westoncodeops.sokoonline.exceptions.InvalidCredentialsException;
import com.westoncodeops.sokoonline.repositories.admin.AdminRepository;
import com.westoncodeops.sokoonline.service.auth.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

private final AdminRepository adminRepository;
private final PasswordEncoder passwordEncoder;
private final JwtService jwtService;
private final RefreshTokenService refreshTokenService;

@Value("${app.security.admin-key-setup}")
private String configuredAdminKey;

public void registerNewAdmin(AdminRegisterRequest request){
    if(adminRepository.existsByEmail(request.email())){
        throw new DuplicateResourceException("Email is active");
    }

    if(!configuredAdminKey.equals(request.secretKey())){
        throw new InvalidCredentialsException("Invalid configuration key");
    }

    Admin admin = Admin.builder().
            email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .permissions(request.initialPermissions()).build();

  adminRepository.save(admin);
}


public AdminAuthResponse loginAdmin(AdminLoginRequest request){
    Admin admin = adminRepository.findByEmail(request.email())
            .orElseThrow(()-> new InvalidCredentialsException("Invalid email"));

    if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
        throw new InvalidCredentialsException("Admin credentials invalid");
    }

    String accessToken = jwtService.generateAccessToken(admin, AccountType.ADMIN);
    String refreshToken = refreshTokenService.issue(admin, admin.getId(), AccountType.ADMIN);

    return new AdminAuthResponse(accessToken, admin.getEmail(), refreshToken);
}

}
