package com.westoncodeops.sokoonline.repositories.auth;

import com.westoncodeops.sokoonline.entities.Auth.OAuthIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentity, UUID> {
    Optional<OAuthIdentity> findByProviderAndProviderSubject(String provider, String providerSubject);
    boolean existsByCustomerIdAndProvider(UUID customerId, String provider);
    boolean existsByCustomerId(UUID customerId);
}
