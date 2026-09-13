package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.requests.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.RegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.dto.responses.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse getUserById(UUID id);
    AuthResponse register(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
    void deleteUser(UUID id);

}
