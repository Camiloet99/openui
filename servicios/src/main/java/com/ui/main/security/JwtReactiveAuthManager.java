package com.ui.main.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Objects;

@Component
public class JwtReactiveAuthManager implements ReactiveAuthenticationManager {

    private final JwtService jwtService;

    public JwtReactiveAuthManager(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        if (authentication == null) return Mono.empty();
        String token = (String) authentication.getCredentials();
        try {
            Claims c = jwtService.parse(token).getBody();
            String email = c.getSubject();
            String role  = Objects.toString(c.get("role"), "USER");
            return Mono.just(new UsernamePasswordAuthenticationToken(
                    email, token, List.of(new SimpleGrantedAuthority("ROLE_" + role))));
        } catch (Exception e) {
            return Mono.empty();
        }
    }
}
