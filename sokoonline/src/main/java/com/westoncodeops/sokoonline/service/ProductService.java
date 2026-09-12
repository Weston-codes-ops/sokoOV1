package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.requests.ProductRequest;
import com.westoncodeops.sokoonline.dto.responses.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProductService {

    Page<ProductResponse> getAllActiveProducts(Pageable pageable);
    Page<ProductResponse> searchProducts(String search, Pageable pageable);
    Page<ProductResponse> getProductsByCategory(String category, Pageable pageable);
    ProductResponse getProductById(UUID id);
    ProductResponse getProductBySlug(String slug);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(UUID id, ProductRequest request);
    void delistProduct(UUID id);
}
