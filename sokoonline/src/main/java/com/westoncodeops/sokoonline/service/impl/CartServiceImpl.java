package com.westoncodeops.sokoonline.service.impl;

import com.westoncodeops.sokoonline.dto.responses.CartItemResponse;
import com.westoncodeops.sokoonline.dto.responses.CartResponse;
import com.westoncodeops.sokoonline.entities.Cart;
import com.westoncodeops.sokoonline.entities.CartItem;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.entities.Product;
import com.westoncodeops.sokoonline.exceptions.BusinessRuleException;
import com.westoncodeops.sokoonline.exceptions.InsufficientStockException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.CartItemRepository;
import com.westoncodeops.sokoonline.repositories.CartRepository;
import com.westoncodeops.sokoonline.repositories.ProductRepository;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import com.westoncodeops.sokoonline.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CartResponse getCart(UUID customerId) {
        Cart cart = getCartForUser(customerId);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(UUID customerId, UUID productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new BusinessRuleException("Quantity must be at least 1");
        }

        Cart cart = getCartForUser(customerId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new BusinessRuleException("Product is no longer available: " + product.getName());
        }

        CartItem existing = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + quantity;
            if (newQty > product.getStockQuantity()) {
                throw new InsufficientStockException("Not enough stock. Available: " + product.getStockQuantity());
            }
            existing.setQuantity(newQty);
            cartItemRepository.save(existing);
        } else {
            if (quantity > product.getStockQuantity()) {
                throw new InsufficientStockException("Not enough stock. Available: " + product.getStockQuantity());
            }
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            cart.getItems().add(cartItem);
            cartItemRepository.save(cartItem);
        }

        return toResponse(getCartForUser(customerId));
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(UUID customerId, UUID productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new BusinessRuleException("Quantity must be at least 1");
        }
        Cart cart = getCartForUser(customerId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart: " + productId));

        if (quantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Not enough stock. Available: " + product.getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItem.setUnitPrice(product.getPrice());
        cartItemRepository.save(cartItem);

        return toResponse(getCartForUser(customerId));
    }

    @Override
    @Transactional
    public CartResponse removeItem(UUID customerId, UUID productId) {
        Cart cart = getCartForUser(customerId);
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        cartItemRepository.flush();
        return toResponse(getCartForUser(customerId));
    }

    @Override
    @Transactional
    public CartResponse clearCart(UUID customerId) {
        Cart cart = getCartForUser(customerId);
        cart.getItems().clear();
        cartRepository.save(cart);
        return toResponse(cart);
    }

    private Cart getCartForUser(UUID customerId) {
        return cartRepository.findCartByCustomerIdWithItems(customerId)
                .orElseGet(()->{
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Customer not found:"));

                    // Lazy Build For cart and save it for them
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .items(new ArrayList<>())
                            .build();

                    return cartRepository.save(newCart);
                });
    }

    private static CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                Product p = item.getProduct();
                if (p == null) {
                    continue;
                }
                BigDecimal unit = item.getUnitPrice() != null ? item.getUnitPrice() : p.getPrice();
                int qty = item.getQuantity() == null ? 0 : item.getQuantity();
                BigDecimal subTotal = unit.multiply(BigDecimal.valueOf(qty));
                total = total.add(subTotal);
                itemResponses.add(new CartItemResponse(
                        p.getId(),
                        p.getName(),
                        p.getImageURL(),
                        unit,
                        qty,
                        subTotal
                ));
            }
        }

        return new CartResponse(cart.getId(), itemResponses, total);
    }
}
