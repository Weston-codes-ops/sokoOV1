package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.requests.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.admin.AdminRegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;

public interface AdminService {
	AuthResponse register(AdminRegisterRequest request);
	AuthResponse login(LoginRequest request);
}
