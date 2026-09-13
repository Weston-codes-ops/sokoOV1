package com.westoncodeops.sokoonline.security;

import com.westoncodeops.sokoonline.repositories.AdminRepository;
import com.westoncodeops.sokoonline.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizedEmail = email.trim().toLowerCase();
        return adminRepository.findByEmail(normalizedEmail)
                .<UserDetails>map(admin -> admin)
                .orElseGet(() -> userRepository.findByEmail(normalizedEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("Account not found: " + email)));
    }
}