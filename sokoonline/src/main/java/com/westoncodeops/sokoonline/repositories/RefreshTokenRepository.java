package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.Auth.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Query("SELECT rt FROM RefreshToken rt " +
            "JOIN FETCH rt.user u " +
            "WHERE rt.tokenHash = :hash AND rt.revokedAt IS NULL")
    Optional<RefreshToken> findActiveByHashWithUser(@Param("hash") String hash);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.revokedAt IS NULL")
    List<RefreshToken> findAllActiveByUserId(@Param("userId") UUID userId);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiresAt <= CURRENT_TIMESTAMP AND rt.revokedAt IS NULL")
    List<RefreshToken> findAllExpiredAndActive();
}
