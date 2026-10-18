package com.westoncodeops.sokoonline.config;


import com.westoncodeops.sokoonline.config.jwt.JwtAuthenticationFilter;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.entities.admin.Admin;
import jakarta.servlet.Filter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:5173}") String allowedOrigins) {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList());
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                           JwtAuthenticationFilter jwtAuthenticationFilter,
                           CorsConfigurationSource corsConfigurationSource,
                           OAuthLoginSuccessHandler oauthSuccessHandler,
                           OAuthLoginFailureHandler oauthFailureHandler) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/api/v1/customers/register", "/api/v1/customers/login",
                "/api/v1/customers/refresh", "/api/v1/customers/verify-email",
                "/api/v1/customers/resend-verification",
                "/api/v1/admin/auth/**", "/api/v1/oauth2/**", "/api/v1/login/oauth2/**",
                "/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**").permitAll()
            .requestMatchers("/api/v1/payments/daraja/callback/**").permitAll()
            .requestMatchers("/api/v1/admin/**").access((authentication, context) ->
                new AuthorizationDecision(authentication.get().getPrincipal() instanceof Admin))
            .requestMatchers("/api/v1/cart/**").access((authentication, context) ->
                new AuthorizationDecision(authentication.get().getPrincipal() instanceof Customer))
            .requestMatchers("/api/v1/checkout/**").access((authentication, context) ->
                new AuthorizationDecision(authentication.get().getPrincipal() instanceof Customer))
            .requestMatchers(HttpMethod.POST, "/api/v1/products/**", "/api/v1/categories/**").access(
                (authentication, context) -> new AuthorizationDecision(
                    authentication.get().getPrincipal() instanceof Admin))
            .requestMatchers(HttpMethod.PUT, "/api/v1/products/**").access(
                (authentication, context) -> new AuthorizationDecision(
                    authentication.get().getPrincipal() instanceof Admin))
            .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").access(
                (authentication, context) -> new AuthorizationDecision(
                    authentication.get().getPrincipal() instanceof Admin))
            .anyRequest().authenticated())
        .oauth2Login(oauth -> oauth
            .authorizationEndpoint(endpoint -> endpoint.baseUri("/api/v1/oauth2/authorization"))
            .redirectionEndpoint(endpoint -> endpoint.baseUri("/api/v1/login/oauth2/code/*"))
            .successHandler(oauthSuccessHandler)
            .failureHandler(oauthFailureHandler))
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
    }

    @Bean
    public FilterRegistrationBean<Filter> jwtFilterServletRegistration(JwtAuthenticationFilter filter) {
    FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
    }
}