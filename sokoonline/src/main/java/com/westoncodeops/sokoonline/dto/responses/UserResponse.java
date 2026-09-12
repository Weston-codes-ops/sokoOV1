package com.westoncodeops.sokoonline.dto.responses;

import com.westoncodeops.sokoonline.enums.Role;

public record UserResponse(String email,
                           String fullName,
                           Role role) {
}
