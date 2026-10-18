package com.westoncodeops.sokoonline.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class OAuthClientConfiguration {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository(
            @Value("${app.oauth.google.client-id:}") String googleClientId,
            @Value("${app.oauth.google.client-secret:}") String googleClientSecret,
            @Value("${app.oauth.yahoo.client-id:}") String yahooClientId,
            @Value("${app.oauth.yahoo.client-secret:}") String yahooClientSecret,
            @Value("${app.oauth.redirect-uri}") String redirectUri,
            @Value("${app.oauth.enabled:false}") boolean oauthEnabled) {
        Map<String, ClientRegistration> registrations = new HashMap<>();
        boolean googleIdConfigured = !googleClientId.isBlank();
        boolean googleSecretConfigured = !googleClientSecret.isBlank();
        boolean yahooIdConfigured = !yahooClientId.isBlank();
        boolean yahooSecretConfigured = !yahooClientSecret.isBlank();

        if (oauthEnabled && (googleIdConfigured != googleSecretConfigured
                || yahooIdConfigured != yahooSecretConfigured)) {
            throw new IllegalStateException(
                    "OAuth is enabled, but a provider has only one of its client ID and client secret configured.");
        }
        if (oauthEnabled && !googleIdConfigured && !yahooIdConfigured) {
            throw new IllegalStateException(
                    "OAuth is enabled, but no provider client credentials are configured.");
        }

        if (oauthEnabled && googleIdConfigured) {
            registrations.put("google", CommonOAuth2Provider.GOOGLE.getBuilder("google")
                    .clientId(googleClientId)
                    .clientSecret(googleClientSecret)
                    .redirectUri(redirectUri)
                    .scope("openid", "profile", "email")
                    .build());
        }
        if (oauthEnabled && yahooIdConfigured) {
            registrations.put("yahoo", ClientRegistration.withRegistrationId("yahoo")
                    .clientId(yahooClientId)
                    .clientSecret(yahooClientSecret)
                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri(redirectUri)
                    .scope("openid", "profile", "email")
                    .authorizationUri("https://api.login.yahoo.com/oauth2/request_auth")
                    .tokenUri("https://api.login.yahoo.com/oauth2/get_token")
                    .userInfoUri("https://api.login.yahoo.com/openid/v1/userinfo")
                    .userNameAttributeName("sub")
                    .clientName("Yahoo")
                    .issuerUri("https://api.login.yahoo.com")
                    .build());
        }

        return registrationId -> registrations.get(registrationId);
    }
}
