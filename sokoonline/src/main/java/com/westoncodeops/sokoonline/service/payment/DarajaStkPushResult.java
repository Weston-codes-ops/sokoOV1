package com.westoncodeops.sokoonline.service.payment;

public record DarajaStkPushResult(
        String merchantRequestId,
        String checkoutRequestId,
        String customerMessage) {
}
