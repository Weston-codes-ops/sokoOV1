package com.westoncodeops.sokoonline.config;

import com.westoncodeops.sokoonline.service.auth.customers.OAuthAuthenticationException;
import com.westoncodeops.sokoonline.service.auth.customers.OAuthLoginService;
import com.westoncodeops.sokoonline.service.auth.customers.OAuthLoginResult;
import com.westoncodeops.sokoonline.exceptions.EmailDeliveryException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuthLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuthLoginService oauthLoginService;

    @Value("${app.oauth.frontend-callback-url}")
    private String callbackUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendRedirect(errorRedirect());
            return;
        }

        try {
            OAuthLoginResult result = oauthLoginService.authenticate(
                    oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getPrincipal());
            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Referrer-Policy", "no-referrer");
            clearOAuthSession(request);
            response.sendRedirect(verificationRedirect(result.verificationEmail(), result.codeSent()));
        } catch (OAuthAuthenticationException ex) {
            log.info("OAuth sign-in rejected: {}", ex.getMessage());
            clearOAuthSession(request);
            response.sendRedirect(errorRedirect());
        } catch (EmailDeliveryException ex) {
            log.error("OAuth email verification message could not be sent", ex);
            clearOAuthSession(request);
            response.sendRedirect(errorRedirect("email"));
        }
    }

    private String verificationRedirect(String email, boolean codeSent) {
        return UriComponentsBuilder.fromUriString(callbackUrl)
                .replacePath("/verify-email")
                .replaceQuery(null)
                .queryParam("email", email)
                .queryParam("sent", codeSent)
                .build()
                .encode()
                .toUriString();
    }

    private String errorRedirect() {
        return errorRedirect("1");
    }

    private String errorRedirect(String error) {
        return UriComponentsBuilder.fromUriString(callbackUrl)
                .replacePath("/login")
                .replaceQuery(null)
                .queryParam("oauthError", error)
                .build()
                .encode()
                .toUriString();
    }

    private void clearOAuthSession(HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
    }
}
