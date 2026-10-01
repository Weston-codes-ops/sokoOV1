package com.westoncodeops.sokoonline.repositories.admin;

import com.westoncodeops.sokoonline.entities.admin.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    Boolean existsByEmail(String email);
    Optional<Admin> findByEmail(String email);
}
