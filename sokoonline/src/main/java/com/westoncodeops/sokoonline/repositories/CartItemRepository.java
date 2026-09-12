package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(UUID cartId, UUID productId);
    void deleteByCartIdAndProductId(UUID cartId, UUID productId);
}
