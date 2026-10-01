package com.westoncodeops.sokoonline.service.auth.customers;


import com.westoncodeops.sokoonline.config.jwt.JwtService;
import com.westoncodeops.sokoonline.dto.requests.auth.LoginRequest;
import com.westoncodeops.sokoonline.dto.requests.auth.RegisterRequest;
import com.westoncodeops.sokoonline.dto.responses.AuthResponse;
import com.westoncodeops.sokoonline.entities.Cart;
import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.enums.AccountType;
import com.westoncodeops.sokoonline.exceptions.DuplicateResourceException;
import com.westoncodeops.sokoonline.exceptions.InvalidCredentialsException;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import com.westoncodeops.sokoonline.service.auth.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CustomerAuthService implements UserDetailsService {

   private final CustomerRepository customerRepository;
   private final PasswordEncoder passwordEncoder;
   private final JwtService jwtService;
   private final RefreshTokenService refreshTokenService;

   public AuthResponse registerUser(RegisterRequest request){
   if(customerRepository.existsByEmail(request.email())){
      throw new DuplicateResourceException("Email already exists");
   }

   Customer customer = Customer.builder().
           name(request.email().split("@")[0]).
           email(request.email())
           .password(passwordEncoder.encode(request.password())).
           build();


   Customer savedCustomer = customerRepository.save(customer);
   return toResponse(savedCustomer,"Registration successful. Please log in.",null,null);

   }


   public AuthResponse login(LoginRequest request){
         Customer customer = customerRepository.findByEmail(request.email()).
                 orElseThrow(()-> new UsernameNotFoundException("User not found"));

         if(!passwordEncoder.matches(request.password(), customer.getPassword())){
            throw new InvalidCredentialsException("Wrong credentials");
         }

      // 2. Generate new tokens for this login session
      String accessToken = jwtService.generateAccessToken(customer, AccountType.USER);
      String refreshToken = refreshTokenService.issue(customer, customer.getId(), AccountType.USER);

      // 3. Map together
      return toResponse(customer,"Welcome",accessToken,refreshToken);


   }


   @Override
   public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
      return customerRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User found not"));
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
