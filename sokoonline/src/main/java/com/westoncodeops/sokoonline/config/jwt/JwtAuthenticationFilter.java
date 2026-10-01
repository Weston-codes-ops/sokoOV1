package com.westoncodeops.sokoonline.config.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.westoncodeops.sokoonline.entities.admin.Admin;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.repositories.admin.AdminRepository;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {


        final String authHeader = request.getHeader("Authorization");
        final String jwt;

        // Skip if there is no bearer token header
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String username = jwtService.extractUserName(jwt);
                if (!"access".equals(jwtService.extractTokenType(jwt))) {
                    throw new JwtException("Token is not an access token");
                }
                AccountType accountType = jwtService.extractAccountType(jwt);
                UserDetails userDetails = loadUser(username, accountType);

                if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Access token expired or invalid");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private UserDetails loadUser(String username, AccountType accountType) {
        if (accountType == AccountType.USER) {
            return customerRepository.findByEmail(username).map(customer -> (Customer) customer).orElse(null);
        }
        return adminRepository.findByEmail(username).map(admin -> (Admin) admin).orElse(null);
    }
}
