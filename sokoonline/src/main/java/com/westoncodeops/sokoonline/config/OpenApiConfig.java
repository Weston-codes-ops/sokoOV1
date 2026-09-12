package com.westoncodeops.sokoonline.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sokoonlineOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sokoonline E-commerce API")
                        .version("1.0.0")
                        .description("User, Product (JSONB categories/subcategories), and Cart services. " +
                                "Authentication uses **JWT Bearer tokens**. Click 'Authorize' below and paste a token. " +
                                "Get a token from POST /api/v1/auth/login or /api/v1/auth/register. " +
                                "Default admin: `admin@sokoonline.dev` / `admin123` (seeded on first run).")
                        .contact(new Contact().name("Sokoonline Backend").email("dev@sokoonline.dev")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local dev")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Bearer authentication. Call POST /api/v1/auth/login or /register to get an access token (15 min) + one-time refresh token (7 days). Use the access token here (no 'Bearer' prefix — Swagger adds it).")));
    }
}
