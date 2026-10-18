package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, UUID> {
    Optional<PaymentAttempt> findByCheckoutRequestId(String checkoutRequestId);
    Optional<PaymentAttempt> findFirstByOrder_IdOrderByCreatedAtDesc(UUID orderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PaymentAttempt p WHERE p.id = :id")
    Optional<PaymentAttempt> findByIdForUpdate(@Param("id") UUID id);
}
