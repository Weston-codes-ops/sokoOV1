package com.westoncodeops.sokoonline.config;

import com.westoncodeops.sokoonline.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:*}")
    private String[] corsAllowedOrigins;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(PUBLIC_PATHS).permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, PRODUCTS_READ_PATHS).permitAll()

                        .requestMatchers(HttpMethod.POST, PRODUCTS_WRITE).hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, PRODUCTS_WRITE_ID).hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, PRODUCTS_WRITE_ID).hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, PRODUCTS_WRITE_ID).hasAuthority("ADMIN")

                        .requestMatchers(CART_PATHS).authenticated()

                        .requestMatchers(ME_PATH).authenticated()
                        .requestMatchers(HttpMethod.GET, USER_BY_ID_PATH).hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, USER_BY_ID_DELETE_PATH).hasAuthority("ADMIN")

                        .anyRequest().authenticated());
        return http.build();
    }

    private static final String[] PUBLIC_PATHS = new String[]{
            "/",
            "/error",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**",
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/admin/auth/register",
            "/api/v1/admin/auth/login",
            "/actuator/health"
    };

    private static final String[] PRODUCTS_READ_PATHS = new String[]{
            "/api/v1/products/**"
    };

    private static final String[] PRODUCTS_WRITE = new String[]{
            "/api/v1/products"
    };
    private static final String[] PRODUCTS_WRITE_ID = new String[]{
            "/api/v1/products/{id}"
    };

    private static final String[] CART_PATHS = new String[]{
            "/api/v1/cart/**"
    };

    private static final String ME_PATH = "/api/v1/auth/me";
    private static final String USER_BY_ID_PATH = "/api/v1/auth/users/{id}";
    private static final String USER_BY_ID_DELETE_PATH = "/api/v1/auth/users/{id}";

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(corsAllowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type", "Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
