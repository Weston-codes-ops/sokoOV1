package com.westoncodeops.sokoonline.security;

import com.westoncodeops.sokoonline.entities.User;
import com.westoncodeops.sokoonline.enums.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static Authentication auth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static boolean isAuthenticated() {
        Authentication a = auth();
        return a != null && a.isAuthenticated()
                && !"anonymousUser".equals(a.getPrincipal());
    }

    public static User entityOrThrow() {
        Authentication a = auth();
        if (a == null || !(a.getPrincipal() instanceof User u)) {
            throw new org.springframework.security.authentication.InsufficientAuthenticationException(
                    "Authentication required");
        }
        return u;
    }

    public static UUID idOrThrow() {
        return entityOrThrow().getId();
    }

    public static String emailOrThrow() {
        return entityOrThrow().getEmail();
    }

    public static Role roleOrThrow() {
        return entityOrThrow().getRole();
    }

    public static boolean isAdmin() {
        try {
            return Role.ADMIN == roleOrThrow();
        } catch (Exception ignored) {
            return false;
        }
    }
}
