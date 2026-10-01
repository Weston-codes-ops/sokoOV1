package com.westoncodeops.sokoonline.dto.requests.admin;

import java.util.Set;

public record AdminRegisterRequest(String email,
                                   String password,
                                   String secretKey,
                                   Set<String> initialPermissions) {


}
