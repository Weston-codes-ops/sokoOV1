package com.westoncodeops.sokoonline.enums;

public enum OrderStatus {
    PENDING,      // Order placed, payment not yet confirmed
    CONFIRMED,    // Payment confirmed, awaiting fulfillment
    PROCESSING,   // Being packed / prepared
    SHIPPED,      // Handed to courier
    DELIVERED,    // Received by customer
    CANCELLED,    // Canceled before shipping
    REFUNDED      // Returned and refunded
}
