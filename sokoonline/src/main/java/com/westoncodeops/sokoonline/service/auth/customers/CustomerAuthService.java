package com.westoncodeops.sokoonline.service.auth.customers;


import com.westoncodeops.sokoonline.config.jwt.JwtService;
import com.westoncodeops.sokoonline.dto.requests.auth.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.auth.RegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.entities.Auth.EmailVerificationPurpose;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.exceptions.DuplicateResourceException;
import com.westoncodeops.sokoonline.exceptions.InvalidCredentialsException;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import com.westoncodeops.sokoonline.repositories.auth.OAuthIdentityRepository;
import com.westoncodeops.sokoonline.service.auth.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerAuthService implements UserDetailsService {

   private final CustomerRepository customerRepository;
   private final PasswordEncoder passwordEncoder;
   private final JwtService jwtService;
   private final RefreshTokenService refreshTokenService;
   private final EmailVerificationService emailVerificationService;
   private final OAuthIdentityRepository oauthIdentityRepository;

   @Transactional
   public AuthResponse registerUser(RegisterRequest request){
   String email = normalizeEmail(request.email());
   if(customerRepository.existsByEmailIgnoreCase(email)){
      throw new DuplicateResourceException("Email already exists");
   }

   Customer customer = Customer.builder()
           .name(email.substring(0, email.indexOf('@')))
           .email(email)
           .password(passwordEncoder.encode(request.password()))
           .emailVerified(false)
           .build();


   Customer savedCustomer = customerRepository.save(customer);
   emailVerificationService.sendInitialCode(savedCustomer);
   return toResponse(savedCustomer,"Verification code sent. Verify your email before signing in.",null,null);

   }


   public AuthResponse login(LoginRequest request){
         Customer customer = customerRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                 .orElseThrow(() -> new InvalidCredentialsException("Email or password is incorrect"));

         if(customer.getPassword() == null
                 || !passwordEncoder.matches(request.password(), customer.getPassword())){
            throw new InvalidCredentialsException("Email or password is incorrect");
         }

      if (!customer.isEmailVerified()) {
         boolean sent = emailVerificationService.sendOrResendCode(customer);
         String message = sent
                 ? "Verify your email address before signing in. A code was sent."
                 : "Verify your email address before signing in. Use the latest code or try again later.";
         return toResponse(customer, message, null, null);
      }

      boolean sent = emailVerificationService.sendLoginCode(customer);
      String message = sent
              ? "A sign-in code was sent to your email. Verify it to continue."
              : "A code was recently sent or the request limit was reached. Use the latest code or try again later.";
      return toResponse(customer, message, null, null);
   }

   @Transactional
   public AuthResponse verifyEmail(String email, String code) {
      EmailVerificationPurpose purpose = emailVerificationService.verify(email, code);
      if (purpose == null) {
         return null;
      }

      Customer customer = customerRepository.findByEmailIgnoreCase(normalizeEmail(email))
              .orElseThrow(() -> new UsernameNotFoundException("User not found"));
      if (purpose == EmailVerificationPurpose.SIGNUP
              && !oauthIdentityRepository.existsByCustomerId(customer.getId())) {
         return toResponse(customer, "Email verified. You can now sign in.", null, null);
      }

      String accessToken = jwtService.generateAccessToken(customer, AccountType.USER);
      String refreshToken = refreshTokenService.issue(customer, customer.getId(), AccountType.USER);
      return toResponse(customer, "Email verified. You are now signed in.", accessToken, refreshToken);
   }

   public void resendVerification(String email) {
      emailVerificationService.resendCode(email);
   }

   @Override
   public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
      return customerRepository.findByEmailIgnoreCase(normalizeEmail(email))
              .orElseThrow(() -> new UsernameNotFoundException("User not found"));
   }

   private String normalizeEmail(String email) {
      return email.trim().toLowerCase(Locale.ROOT);
   }

   private AuthResponse toResponse(Customer customer, String message, String accessToken, String refreshToken ){
      return new AuthResponse(
               customer.getId(),
              customer.getEmail(),
              customer.getName(),
              message,
              accessToken,
              refreshToken
      );
   }

}
