package com.westoncodeops.sokoonline.repositories;

import com.westoncodeops.sokoonline.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByParentIsNullOrderByNameAsc();
    List<Category> findAllByParentIdOrderByNameAsc(UUID parentId);
    boolean existsByNameIgnoreCaseAndParentId(String name, UUID parentId);
    boolean existsByNameIgnoreCaseAndParentIsNull(String name);
}
