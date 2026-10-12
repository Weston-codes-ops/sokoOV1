package com.westoncodeops.sokoonline.entities.Auth;

import com.westoncodeops.sokoonline.entities.Customer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "oauth_identity", uniqueConstraints = {
        @UniqueConstraint(name = "uk_oauth_provider_subject", columnNames = {"provider", "provider_subject"}),
        @UniqueConstraint(name = "uk_oauth_customer_provider", columnNames = {"customer_id", "provider"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 30)
    private String provider;

    @Column(name = "provider_subject", nullable = false, length = 255)
    private String providerSubject;
}
