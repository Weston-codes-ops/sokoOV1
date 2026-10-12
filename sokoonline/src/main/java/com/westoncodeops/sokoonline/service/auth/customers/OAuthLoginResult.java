package com.westoncodeops.sokoonline.service.auth.customers;

public record OAuthLoginResult(String verificationEmail, boolean codeSent) {}
