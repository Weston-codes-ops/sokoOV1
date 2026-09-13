package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.Auth.RefreshToken;
import com.westoncodeops.sokoonline.enums.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

        Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String hash);

        List<RefreshToken> findAllByOwnerIdAndOwnerTypeAndRevokedAtIsNull(UUID ownerId, AccountType ownerType);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiresAt <= CURRENT_TIMESTAMP AND rt.revokedAt IS NULL")
    List<RefreshToken> findAllExpiredAndActive();
}
