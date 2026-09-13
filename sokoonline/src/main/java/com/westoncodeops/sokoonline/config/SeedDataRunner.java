package com.westoncodeops.sokoonline.config;

import com.westoncodeops.sokoonline.entities.Admin;
import com.westoncodeops.sokoonline.repositories.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("dev")
public class SeedDataRunner implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ensureAdminExists("admin@sokoonline.dev", "admin123", "System", "Administrator");
        ensureAdminExists("alice-admin@test.com", "admin123", "Alice", "Admin");
    }

    private void ensureAdminExists(String email, String rawPassword, String firstName, String lastName) {
        if (adminRepository.existsByEmail(email)) {
            log.debug("Admin user already exists, skipping seed: {}", email);
            return;
        }
        Admin admin = Admin.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(rawPassword))
                .build();
            adminRepository.save(admin);

        log.info("Seeded ADMIN user: {} / {} (change password in production!)", email, rawPassword);
    }
}
