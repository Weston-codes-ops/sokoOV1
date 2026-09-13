package com.westoncodeops.sokoonline.security;

import com.westoncodeops.sokoonline.enums.Role;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface AccountPrincipal extends UserDetails {
    UUID getId();
    String getEmail();
    Role getRole();
}