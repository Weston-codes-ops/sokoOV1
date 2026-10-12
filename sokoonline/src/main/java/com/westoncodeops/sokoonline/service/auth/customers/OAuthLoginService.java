package com.westoncodeops.sokoonline.service.auth.customers;

import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.entities.Auth.OAuthIdentity;
import com.westoncodeops.sokoonline.repositories.auth.OAuthIdentityRepository;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuthLoginService {

    private final OAuthIdentityRepository identityRepository;
    private final CustomerRepository customerRepository;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public OAuthLoginResult authenticate(String provider, OAuth2User principal) {
        Map<String, Object> attributes = principal.getAttributes();
        String email = stringAttribute(attributes, "email");
        String subject = stringAttribute(attributes, "sub");
        Object verifiedClaim = attributes.get("email_verified");
        boolean emailVerified = Boolean.TRUE.equals(verifiedClaim)
                || "true".equalsIgnoreCase(String.valueOf(verifiedClaim));

        if (email == null || subject == null || !emailVerified) {
            throw new OAuthAuthenticationException("The provider did not return a verified email address.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        String normalizedProvider = provider.toLowerCase(Locale.ROOT);
        Optional<OAuthIdentity> existingIdentity =
                identityRepository.findByProviderAndProviderSubject(normalizedProvider, subject);
        Customer customer;
        if (existingIdentity.isPresent()) {
            customer = existingIdentity.get().getCustomer();
        } else {
            customer = linkOrCreateCustomer(normalizedProvider, subject, normalizedEmail, attributes);
        }

        boolean codeSent = customer.isEmailVerified()
                ? emailVerificationService.sendLoginCode(customer)
                : emailVerificationService.sendOrResendCode(customer);
        return new OAuthLoginResult(customer.getEmail(), codeSent);
    }

    private Customer linkOrCreateCustomer(String provider, String subject, String email,
                                          Map<String, Object> attributes) {
        Customer customer = customerRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            String name = stringAttribute(attributes, "name");
            if (name == null || name.isBlank()) {
                name = email.substring(0, email.indexOf('@'));
            }
            return Customer.builder()
                    .name(name)
                    .email(email)
                    .emailVerified(false)
                    .build();
        });

        if (customer.getId() != null
                && identityRepository.existsByCustomerIdAndProvider(customer.getId(), provider)) {
            throw new OAuthAuthenticationException("A different account for this provider is already linked.");
        }

        customer = customerRepository.save(customer);
        identityRepository.save(OAuthIdentity.builder()
                .customer(customer)
                .provider(provider)
                .providerSubject(subject)
                .build());
        return customer;
    }

    private String stringAttribute(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value instanceof String text && !text.isBlank() ? text : null;
    }

}
