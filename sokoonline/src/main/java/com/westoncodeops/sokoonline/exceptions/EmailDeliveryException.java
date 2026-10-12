package com.westoncodeops.sokoonline.exceptions;

public class EmailDeliveryException extends RuntimeException {
    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
