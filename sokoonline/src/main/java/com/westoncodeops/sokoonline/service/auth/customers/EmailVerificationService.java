package com.westoncodeops.sokoonline.service.auth.customers;

import com.westoncodeops.sokoonline.entities.Customer;
import com.westoncodeops.sokoonline.entities.Auth.EmailVerification;
import com.westoncodeops.sokoonline.entities.Auth.EmailVerificationPurpose;
import com.westoncodeops.sokoonline.repositories.auth.EmailVerificationRepository;
import com.westoncodeops.sokoonline.repositories.user.CustomerRepository;
import com.westoncodeops.sokoonline.exceptions.EmailDeliveryException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final Duration CODE_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final Duration RESEND_WINDOW = Duration.ofHours(1);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int MAX_RESENDS_PER_HOUR = 5;

    private final CustomerRepository customerRepository;
    private final EmailVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.mail.from}")
    private String fromAddress;

    @Transactional
    public void sendInitialCode(Customer customer) {
        sendCode(customer, EmailVerificationPurpose.SIGNUP, Instant.now(), 0);
    }

    @Transactional
    public boolean sendOrResendCode(Customer customer) {
        return issueCode(customer, EmailVerificationPurpose.SIGNUP);
    }

    @Transactional
    public boolean sendLoginCode(Customer customer) {
        return issueCode(customer, EmailVerificationPurpose.LOGIN);
    }

    @Transactional
    public void resendCode(String rawEmail) {
        customerRepository.findByEmailIgnoreCase(normalizeEmail(rawEmail))
                .ifPresent(customer -> {
                    Optional<EmailVerification> existing = verificationRepository.findByCustomerId(customer.getId());
                    if (existing.isEmpty()) {
                        return;
                    }
                    EmailVerification verification = existing.get();
                    if (customer.isEmailVerified()
                            && verification.getPurpose() != EmailVerificationPurpose.LOGIN) {
                        return;
                    }
                    if (!customer.isEmailVerified()
                            && verification.getPurpose() != EmailVerificationPurpose.SIGNUP) {
                        return;
                    }
                    issueCode(customer, verification.getPurpose());
                });
    }

    @Transactional
    public EmailVerificationPurpose verify(String rawEmail, String code) {
        Optional<Customer> foundCustomer = customerRepository.findByEmailIgnoreCase(normalizeEmail(rawEmail));
        if (foundCustomer.isEmpty()) {
            return null;
        }

        Customer customer = foundCustomer.get();
        Optional<EmailVerification> foundVerification =
                verificationRepository.findByCustomerId(customer.getId());
        if (foundVerification.isEmpty()) {
            return null;
        }

        EmailVerification verification = foundVerification.get();
        Instant now = Instant.now();
        if (verification.getConsumedAt() != null
                || !verification.getExpiresAt().isAfter(now)
                || verification.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            return null;
        }
        if ((verification.getPurpose() == EmailVerificationPurpose.SIGNUP && customer.isEmailVerified())
                || (verification.getPurpose() == EmailVerificationPurpose.LOGIN && !customer.isEmailVerified())) {
            return null;
        }

        if (!passwordEncoder.matches(code, verification.getCodeHash())) {
            verification.setFailedAttempts(verification.getFailedAttempts() + 1);
            verificationRepository.save(verification);
            return null;
        }

        if (verification.getPurpose() == EmailVerificationPurpose.SIGNUP) {
            customer.setEmailVerified(true);
            customer.setEmailVerifiedAt(LocalDateTime.ofInstant(now, ZoneOffset.UTC));
            customerRepository.save(customer);
        }
        verification.setConsumedAt(now);
        verificationRepository.save(verification);
        return verification.getPurpose();
    }

    private boolean issueCode(Customer customer, EmailVerificationPurpose purpose) {
        Instant now = Instant.now();
        Optional<EmailVerification> existing = verificationRepository.findByCustomerId(customer.getId());
        int resendCount = 0;
        if (existing.isPresent()) {
            EmailVerification previous = existing.get();
            if (previous.getPurpose() == purpose) {
                if (previous.getSentAt().plus(RESEND_COOLDOWN).isAfter(now)) {
                    return false;
                }
                boolean withinWindow = previous.getSentAt().plus(RESEND_WINDOW).isAfter(now);
                if (withinWindow && previous.getResendCount() >= MAX_RESENDS_PER_HOUR) {
                    return false;
                }
                resendCount = withinWindow ? previous.getResendCount() + 1 : 1;
            }
        }
        sendCode(customer, purpose, now, resendCount);
        return true;
    }

    private void sendCode(Customer customer, EmailVerificationPurpose purpose, Instant sentAt, int resendCount) {
        String code = String.format(Locale.ROOT, "%06d", secureRandom.nextInt(1_000_000));
        EmailVerification verification = verificationRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> EmailVerification.builder().customer(customer).build());
        verification.setPurpose(purpose);
        verification.setCodeHash(passwordEncoder.encode(code));
        verification.setExpiresAt(sentAt.plus(CODE_LIFETIME));
        verification.setSentAt(sentAt);
        verification.setFailedAttempts(0);
        verification.setResendCount(resendCount);
        verification.setConsumedAt(null);
        verificationRepository.save(verification);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(customer.getEmail());
        message.setSubject(purpose == EmailVerificationPurpose.LOGIN
                ? "Your SokoOnline sign-in code"
                : "Verify your SokoOnline account");
        message.setText("Your SokoOnline " + purpose.name().toLowerCase(Locale.ROOT) + " code is " + code
                + ". It expires in 10 minutes. If you did not request this code, you can ignore this email.");
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new EmailDeliveryException("The verification email could not be sent. Please try again later.", ex);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
