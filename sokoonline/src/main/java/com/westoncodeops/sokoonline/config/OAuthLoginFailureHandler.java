package com.westoncodeops.sokoonline.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@Slf4j
public class OAuthLoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.oauth.frontend-callback-url}")
    private String callbackUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.info("OAuth provider authentication failed: {}", exception.getClass().getSimpleName());
        response.setHeader("Cache-Control", "no-store");
        response.sendRedirect(UriComponentsBuilder.fromUriString(callbackUrl)
                .replacePath("/login")
                .replaceQuery(null)
                .queryParam("oauthError", "1")
                .build()
                .encode()
                .toUriString());
    }
}
