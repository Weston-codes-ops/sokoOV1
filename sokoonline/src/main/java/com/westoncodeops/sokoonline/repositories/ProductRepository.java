package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Boolean existsBySlug(String slug);
    Optional<Product> findBySlug(String slug);
    Page<Product> findByIsActiveTrue(Pageable pageable);

    @Query("""
SELECT p FROM Product p
WHERE p.isActive = true
AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
""")
    Page<Product> searchActive(@Param("search") String search, Pageable pageable);

    @Query(value = """
SELECT * FROM product p
WHERE p.is_active = true
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(COALESCE(p.categories, '[]'::jsonb)) AS c
    WHERE LOWER(c) = LOWER(:category)
  )
""", countQuery = """
SELECT COUNT(*) FROM product p
WHERE p.is_active = true
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(COALESCE(p.categories, '[]'::jsonb)) AS c
    WHERE LOWER(c) = LOWER(:category)
  )
""", nativeQuery = true)
    Page<Product> findByCategoryName(@Param("category") String category, Pageable pageable);
}
