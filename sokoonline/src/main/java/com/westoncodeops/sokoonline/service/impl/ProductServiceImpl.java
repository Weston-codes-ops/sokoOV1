package com.westoncodeops.sokoonline.service.impl;

import com.westoncodeops.sokoonline.dto.requests.ProductRequest;
import com.westoncodeops.sokoonline.dto.responses.ProductResponse;
import com.westoncodeops.sokoonline.entities.Product;
import com.westoncodeops.sokoonline.exceptions.BusinessRuleException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.ProductRepository;
import com.westoncodeops.sokoonline.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Pattern NON_LATIN_OR_SPACE = Pattern.compile("[^\\p{Alnum} -]");
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String search, Pageable pageable) {
        return productRepository.searchActive(search.trim(), pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        String target = category == null ? null : category.trim();
        if (target == null || target.isEmpty()) {
            return getAllActiveProducts(pageable);
        }
        return productRepository.findByCategoryName(target, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found for slug: " + slug));
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String slug = generateUniqueSlug(request.name());
        Product product = Product.builder()
                .name(validateNotEmpty(request.name(), "name"))
                .slug(slug)
                .description(validateNotEmpty(request.description(), "description"))
                .stockQuantity(request.stockQuantity() == null ? 0 : request.stockQuantity())
                .price(request.price())
                .imageURL(request.imageURL())
                .isActive(true)
                .categories(safeList(request.categories()))
                .subcategories(safeList(request.subcategories()))
                .build();
        productRepository.saveAndFlush(product);
        return toResponse(productRepository.findById(product.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        if (request.name() != null && !request.name().equals(product.getName())) {
            product.setName(validateNotEmpty(request.name(), "name"));
            String newSlug = generateUniqueSlug(request.name());
            if (!newSlug.equals(product.getSlug()) && !productRepository.existsBySlug(newSlug)) {
                product.setSlug(newSlug);
            }
        }
        if (request.description() != null) {
            product.setDescription(validateNotEmpty(request.description(), "description"));
        }
        if (request.stockQuantity() != null) {
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.imageURL() != null) {
            product.setImageURL(request.imageURL());
        }
        if (request.categories() != null) {
            product.setCategories(safeList(request.categories()));
        }
        if (request.subcategories() != null) {
            product.setSubcategories(safeList(request.subcategories()));
        }
        productRepository.save(product);
        return toResponse(product);
    }

    @Override
    @Transactional
    public void delistProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    private String generateUniqueSlug(String name) {
        String base = generateSlug(name);
        if (!productRepository.existsBySlug(base)) {
            return base;
        }
        String candidate;
        int counter = 1;
        do {
            candidate = base + "-" + counter;
            counter++;
        } while (productRepository.existsBySlug(candidate));
        return candidate;
    }

    private static String generateSlug(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Product name is required to generate a slug");
        }
        String normalized = Normalizer.normalize(name.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lowered = normalized.toLowerCase(Locale.ENGLISH);
        String cleaned = NON_LATIN_OR_SPACE.matcher(lowered).replaceAll("");
        String hyphenated = cleaned.replaceAll("\\s+", "-");
        String collapsed = hyphenated.replaceAll("-{2,}", "-");
        String stripped = collapsed.replaceAll("^-|-$", "");
        if (stripped.isEmpty()) {
            stripped = "product-" + UUID.randomUUID().toString().substring(0, 8);
        }
        return HtmlUtils.htmlEscape(stripped);
    }

    private static String validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new BusinessRuleException(fieldName + " must not be empty");
        }
        return value.trim();
    }

    private static List<String> safeList(List<String> source) {
        if (source == null) {
            return new ArrayList<>();
        }
        return source.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageURL(),
                product.getIsActive(),
                product.getCategories() == null ? List.of() : product.getCategories(),
                product.getSubcategories() == null ? List.of() : product.getSubcategories(),
                product.getCreatedAt()
        );
    }
}
