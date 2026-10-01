package com.westoncodeops.sokoonline.config.jwt;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import com.westoncodeops.sokoonline.enums.AccountType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.Instant;
import java.util.function.Function;

@Service
public class JwtService {
    // Build access token & Refresh Token

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration-ms}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpiration;

    public String generateAccessToken(UserDetails user, AccountType accountType){
        Map<String, Object> extraClaims = new HashMap<>();
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();

        extraClaims.put("roles", roles);
        extraClaims.put("accountType", accountType.name());
        extraClaims.put("tokenType", "access");
        return buildToken(extraClaims, user, accessTokenExpiration);
    }

    public String generateRefreshToken(UserDetails user, AccountType accountType){
        Map<String, Object> claims = new HashMap<>();
        claims.put("accountType", accountType.name());
        claims.put("tokenType", "refresh");
        return buildToken(claims, user, refreshTokenExpiration);
    }

    public boolean isTokenValid(String token, UserDetails user){
        final String username = extractUserName(token);
        return (username.equals(user.getUsername())) && !isTokenExpired(token);
    }

    public String extractUserName(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public Instant extractIssuedAt(String token) {
        return extractClaim(token, Claims::getIssuedAt).toInstant();
    }

    public Instant extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration).toInstant();
    }

    public AccountType extractAccountType(String token) {
        String accountType = extractClaim(token, claims -> claims.get("accountType", String.class));
        if (accountType == null) {
            throw new JwtException("Token has no account type");
        }
        try {
            return AccountType.valueOf(accountType);
        } catch (IllegalArgumentException ex) {
            throw new JwtException("Token has an invalid account type", ex);
        }
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", String.class));
    }


    private String buildToken(Map<String, Object> extraClaims, UserDetails user, long expiration){
        return Jwts.builder()
                .claims(extraClaims)
                .subject(user.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }


    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private SecretKey getSigningKey(){
      byte [] keyBytes = Decoders.BASE64.decode(secret);
      return Keys.hmacShaKeyFor(keyBytes);
    }
}
