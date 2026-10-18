package com.westoncodeops.sokoonline.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Pattern(regexp = "[0-9+() .-]{9,24}", message = "Enter a valid Kenyan phone number") String phoneNumber,
        @NotBlank @Size(max = 100) String county,
        @NotBlank @Size(max = 100) String town,
        @NotBlank @Size(max = 255) String deliveryAddress,
        @Size(max = 500) String deliveryNotes) {
}
