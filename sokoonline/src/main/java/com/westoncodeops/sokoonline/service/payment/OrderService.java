package com.westoncodeops.sokoonline.service.payment;

import com.westoncodeops.sokoonline.dto.requests.CheckoutRequest;
import com.westoncodeops.sokoonline.dto.responses.OrderPaymentStatusResponse;
import com.westoncodeops.sokoonline.entities.Cart;
import com.westoncodeops.sokoonline.entities.CartItem;
import com.westoncodeops.sokoonline.entities.CustomerOrder;
import com.westoncodeops.sokoonline.entities.OrderItem;
import com.westoncodeops.sokoonline.entities.PaymentAttempt;
import com.westoncodeops.sokoonline.entities.Product;
import com.westoncodeops.sokoonline.enums.OrderStatus;
import com.westoncodeops.sokoonline.enums.PaymentStatus;
import com.westoncodeops.sokoonline.exceptions.BusinessRuleException;
import com.westoncodeops.sokoonline.exceptions.InsufficientStockException;
import com.westoncodeops.sokoonline.exceptions.ResourceNotFoundException;
import com.westoncodeops.sokoonline.repositories.CartRepository;
import com.westoncodeops.sokoonline.repositories.CustomerOrderRepository;
import com.westoncodeops.sokoonline.repositories.PaymentAttemptRepository;
import com.westoncodeops.sokoonline.repositories.ProductRepository;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private static final BigDecimal FREE_DELIVERY_FEE = BigDecimal.ZERO.setScale(2);

    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final ProductRepository productRepository;

    public OrderService(
            CartRepository cartRepository,
            CustomerRepository customerRepository,
            CustomerOrderRepository customerOrderRepository,
            PaymentAttemptRepository paymentAttemptRepository,
            ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.customerRepository = customerRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public PendingOrder createPendingOrder(UUID customerId, CheckoutRequest request) {
        Cart cart = cartRepository.findCartByCustomerIdWithItems(customerId)
                .orElseThrow(() -> new BusinessRuleException("Your cart is empty."));
        if (cart.getItems().isEmpty()) {
            throw new BusinessRuleException("Your cart is empty.");
        }

        CustomerOrder order = CustomerOrder.builder()
                .customer(customerRepository.getReferenceById(customerId))
                .status(OrderStatus.PENDING)
                .fullName(request.fullName().trim())
                .email(request.email().trim())
                .phoneNumber(normalizeKenyanPhone(request.phoneNumber()))
                .county(request.county().trim())
                .town(request.town().trim())
                .deliveryAddress(request.deliveryAddress().trim())
                .deliveryNotes(request.deliveryNotes() == null || request.deliveryNotes().isBlank()
                        ? null : request.deliveryNotes().trim())
                .deliveryFee(FREE_DELIVERY_FEE)
                .items(new ArrayList<>())
                .paymentAttempts(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO.setScale(2);
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (Boolean.FALSE.equals(product.getIsActive())) {
                throw new BusinessRuleException(product.getName() + " is no longer available.");
            }
            Integer cartQuantity = cartItem.getQuantity();
            if (cartQuantity == null || cartQuantity < 1) {
                throw new BusinessRuleException("Your cart contains an invalid quantity. Please update it and try again.");
            }
            int quantity = cartQuantity;
            if (quantity < 1 || product.getStockQuantity() < quantity) {
                throw new InsufficientStockException(
                        "Not enough stock for " + product.getName() + ". Available: " + product.getStockQuantity());
            }

            BigDecimal unitPrice = product.getPrice().setScale(2, RoundingMode.UNNECESSARY);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineTotal);
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .imageURL(product.getImageURL())
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .lineTotal(lineTotal)
                    .build());
        }

        if (subtotal.signum() <= 0 || subtotal.stripTrailingZeros().scale() > 0) {
            throw new BusinessRuleException("The order total must be a positive whole number of Kenyan shillings.");
        }

        order.setItemsSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(FREE_DELIVERY_FEE));

        PaymentAttempt attempt = PaymentAttempt.builder()
                .order(order)
                .provider("DARAJA")
                .status(PaymentStatus.PENDING)
                .phoneNumber(order.getPhoneNumber())
                .amount(order.getTotalAmount())
                .build();
        order.getPaymentAttempts().add(attempt);

        CustomerOrder savedOrder = customerOrderRepository.save(order);
        PaymentAttempt savedAttempt = savedOrder.getPaymentAttempts().get(0);
        return new PendingOrder(savedOrder.getId(), savedAttempt.getId(),
                savedAttempt.getPhoneNumber(), savedAttempt.getAmount());
    }

    @Transactional
    public void recordStkPushAccepted(UUID paymentAttemptId, String merchantRequestId,
                                      String checkoutRequestId, String message) {
        PaymentAttempt attempt = getAttempt(paymentAttemptId);
        attempt.setMerchantRequestId(merchantRequestId);
        attempt.setCheckoutRequestId(checkoutRequestId);
        attempt.setResultDescription(message);
    }

    @Transactional
    public void markInitiationFailed(UUID paymentAttemptId, String reason) {
        PaymentAttempt attempt = getAttempt(paymentAttemptId);
        if (attempt.getStatus() != PaymentStatus.PENDING) {
            return;
        }
        attempt.setStatus(PaymentStatus.FAILED);
        attempt.setResultDescription(limit(reason == null ? "Could not start the payment request." : reason));
        attempt.getOrder().setStatus(OrderStatus.CANCELLED);
    }

    @Transactional
    public void recordFailedPayment(UUID paymentAttemptId, int resultCode, String description) {
        PaymentAttempt attempt = getAttempt(paymentAttemptId);
        if (attempt.getStatus() != PaymentStatus.PENDING) {
            return;
        }
        attempt.setStatus(PaymentStatus.FAILED);
        attempt.setResultCode(resultCode);
        attempt.setResultDescription(limit(description));
        attempt.getOrder().setStatus(OrderStatus.CANCELLED);
    }

    @Transactional
    public void completeSuccessfulPayment(UUID paymentAttemptId, int resultCode,
                                          String description, String receiptNumber) {
        PaymentAttempt attempt = getAttempt(paymentAttemptId);
        if (attempt.getStatus() != PaymentStatus.PENDING) {
            return;
        }

        CustomerOrder order = attempt.getOrder();
        for (OrderItem item : order.getItems()) {
            int updatedRows = productRepository.decrementStockIfAvailable(item.getProductId(), item.getQuantity());
            if (updatedRows != 1) {
                throw new InsufficientStockException(
                        "Payment was received, but " + item.getProductName()
                                + " is no longer available in the requested quantity. Please contact the store.");
            }
        }

        attempt.setStatus(PaymentStatus.SUCCEEDED);
        attempt.setResultCode(resultCode);
        attempt.setResultDescription(limit(description));
        attempt.setMpesaReceiptNumber(receiptNumber);
        order.setStatus(OrderStatus.CONFIRMED);
        removeOrderedQuantitiesFromCart(order);
    }

    @Transactional
    public void recordPaidOrderStockFailure(UUID paymentAttemptId, int resultCode,
                                            String receiptNumber, String description) {
        PaymentAttempt attempt = getAttempt(paymentAttemptId);
        if (attempt.getStatus() != PaymentStatus.PENDING) {
            return;
        }
        attempt.setStatus(PaymentStatus.SUCCEEDED);
        attempt.setResultCode(resultCode);
        attempt.setMpesaReceiptNumber(receiptNumber);
        attempt.setResultDescription(limit(description));
        attempt.getOrder().setStatus(OrderStatus.CANCELLED);
    }

    @Transactional
    public void recordPaymentVerificationIssue(UUID paymentAttemptId, int resultCode, String description) {
        PaymentAttempt attempt = getAttempt(paymentAttemptId);
        if (attempt.getStatus() != PaymentStatus.PENDING) {
            return;
        }
        attempt.setStatus(PaymentStatus.REVIEW_REQUIRED);
        attempt.setResultCode(resultCode);
        attempt.setResultDescription(limit(description));
        attempt.getOrder().setStatus(OrderStatus.CANCELLED);
    }

    @Transactional(readOnly = true)
    public OrderPaymentStatusResponse getOrderStatus(UUID customerId, UUID orderId) {
        CustomerOrder order = customerOrderRepository.findByIdAndCustomer_Id(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        PaymentAttempt attempt = paymentAttemptRepository.findFirstByOrder_IdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment attempt not found."));
        String message = statusMessage(order, attempt);
        return new OrderPaymentStatusResponse(
                order.getId(),
                order.getStatus().name(),
                attempt.getStatus().name(),
                attempt.getAmount(),
                attempt.getMpesaReceiptNumber(),
                message,
                attempt.getUpdatedAt());
    }

    private void removeOrderedQuantitiesFromCart(CustomerOrder order) {
        Cart cart = cartRepository.findCartByCustomerIdWithItems(order.getCustomer().getId()).orElse(null);
        if (cart == null) {
            return;
        }
        Map<UUID, Integer> orderedQuantities = new HashMap<>();
        for (OrderItem item : order.getItems()) {
            orderedQuantities.put(item.getProductId(), item.getQuantity());
        }

        cart.getItems().removeIf(cartItem -> {
            Integer orderedQuantity = orderedQuantities.get(cartItem.getProduct().getId());
            if (orderedQuantity == null) {
                return false;
            }
            if (cartItem.getQuantity() <= orderedQuantity) {
                return true;
            }
            cartItem.setQuantity(cartItem.getQuantity() - orderedQuantity);
            return false;
        });
    }

    private PaymentAttempt getAttempt(UUID paymentAttemptId) {
        return paymentAttemptRepository.findByIdForUpdate(paymentAttemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment attempt not found."));
    }

    private static String normalizeKenyanPhone(String input) {
        String digits = input.replaceAll("\\D", "");
        if (digits.startsWith("254") && digits.length() == 12) {
            return digits;
        }
        if (digits.length() == 10 && digits.startsWith("0")) {
            return "254" + digits.substring(1);
        }
        if (digits.length() == 9 && (digits.startsWith("7") || digits.startsWith("1"))) {
            return "254" + digits;
        }
        throw new BusinessRuleException("Enter a valid Kenyan M-Pesa number, such as 07XX XXX XXX.");
    }

    private static String statusMessage(CustomerOrder order, PaymentAttempt attempt) {
        if (attempt.getStatus() == PaymentStatus.PENDING) {
            return "Waiting for M-Pesa payment confirmation.";
        }
        if (attempt.getStatus() == PaymentStatus.FAILED) {
            return attempt.getResultDescription() == null
                    ? "The M-Pesa payment was not completed." : attempt.getResultDescription();
        }
        if (attempt.getStatus() == PaymentStatus.REVIEW_REQUIRED) {
            return attempt.getResultDescription();
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return attempt.getResultDescription();
        }
        return "Payment received. Your order is confirmed.";
    }

    private static String limit(String text) {
        if (text == null || text.isBlank()) {
            return "No result description was provided.";
        }
        return text.length() <= 500 ? text : text.substring(0, 500);
    }
}
