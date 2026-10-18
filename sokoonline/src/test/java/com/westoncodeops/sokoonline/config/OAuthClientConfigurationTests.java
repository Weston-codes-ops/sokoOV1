package com.westoncodeops.sokoonline.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

class OAuthClientConfigurationTests {

    private final OAuthClientConfiguration configuration = new OAuthClientConfiguration();
    private static final String REDIRECT_URI =
            "http://localhost:8080/api/v1/login/oauth2/code/{registrationId}";

    @Test
    void enabledOAuthRequiresAtLeastOneProvider() {
        assertThrows(IllegalStateException.class, () ->
                configuration.clientRegistrationRepository("", "", "", "", REDIRECT_URI, true));
    }

    @Test
    void enabledOAuthRejectsPartialProviderCredentials() {
        assertThrows(IllegalStateException.class, () ->
                configuration.clientRegistrationRepository("client-id", "", "", "", REDIRECT_URI, true));
    }
}
