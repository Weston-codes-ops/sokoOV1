package com.westoncodeops.sokoonline.repositories.auth;

import com.westoncodeops.sokoonline.entities.Auth.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {
    Optional<EmailVerification> findByCustomerId(UUID customerId);
    void deleteByCustomerId(UUID customerId);
}
