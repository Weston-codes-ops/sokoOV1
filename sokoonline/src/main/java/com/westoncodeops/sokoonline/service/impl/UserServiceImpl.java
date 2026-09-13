package com.westoncodeops.sokoonline.service.impl;

import com.westoncodeops.sokoonline.dto.requests.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.RegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.dto.responses.UserResponse;
import com.westoncodeops.sokoonline.entities.Cart;
import com.westoncodeops.sokoonline.entities.User;
import com.westoncodeops.sokoonline.enums.Role;
import com.westoncodeops.sokoonline.exceptions.DuplicateResourceException;
import com.westoncodeops.sokoonline.exceptions.InvalidCredentialsException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.CartRepository;
import com.westoncodeops.sokoonline.repositories.UserRepository;
import com.westoncodeops.sokoonline.security.jwt.JwtService;
import com.westoncodeops.sokoonline.service.RefreshTokenService;
import com.westoncodeops.sokoonline.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return toResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();
        userRepository.save(user);

        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.issueRefreshToken(user);
        return toAuthResponse(user, "Registration successful", accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.issueRefreshToken(user);
        return toAuthResponse(user, "Login successful", accessToken, refreshToken);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        refreshTokenService.revokeAllRefreshTokensForUser(id);
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User user) {
        String fullName = user.getFirstName() + " " + user.getLastName();
        return new UserResponse(
                user.getEmail(),
                fullName,
                user.getRole()
        );
    }

    private AuthResponse toAuthResponse(User user, String message, String accessToken, String refreshToken) {
        String fullName = user.getFirstName() + " " + user.getLastName();
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                fullName,
                user.getRole(),
                message,
                accessToken,
                refreshToken
        );
    }
}
