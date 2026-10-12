package com.westoncodeops.sokoonline.entities.Auth;

import com.westoncodeops.sokoonline.entities.Customer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_verification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EmailVerificationPurpose purpose;

    @Column(nullable = false, length = 60)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant sentAt;

    @Column(nullable = false)
    private int failedAttempts;

    @Column(nullable = false)
    private int resendCount;

    private Instant consumedAt;
}
