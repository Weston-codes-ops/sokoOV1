package com.westoncodeops.sokoonline.repositories.user;

import com.westoncodeops.sokoonline.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByEmailIgnoreCase(String email);
    Boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
}
