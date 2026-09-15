package com.westoncodeops.sokoonline.controllers;

import com.westoncodeops.sokoonline.dto.requests.CategoryRequest;
import com.westoncodeops.sokoonline.dto.responses.CategoryResponse;
import com.westoncodeops.sokoonline.entities.Category;
import com.westoncodeops.sokoonline.exceptions.DuplicateResourceException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.CategoryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream().map(CategoryController::toResponse).toList();
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        String name = request.name().trim();
        Category parent = request.parentId() == null ? null : categoryRepository.findById(request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + request.parentId()));
        boolean exists = parent == null
                ? categoryRepository.existsByNameIgnoreCaseAndParentIsNull(name)
                : categoryRepository.existsByNameIgnoreCaseAndParentId(name, parent.getId());
        if (exists) throw new DuplicateResourceException("Category already exists: " + name);
        Category created = categoryRepository.save(Category.builder().name(name).parent(parent).build());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    private static CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getParent() == null ? null : category.getParent().getId());
    }
}
