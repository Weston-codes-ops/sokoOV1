package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUser_Id(UUID userId);

    @Query("""
SELECT c from Cart c
LEFT JOIN FETCH c.items i
LEFT JOIN FETCH i.product
WHERE c.user.id = :userId
""")
    Optional<Cart> findCartByUserIdWithItems(@Param("userId") UUID userId);

}
