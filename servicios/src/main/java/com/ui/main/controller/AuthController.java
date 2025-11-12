package com.ui.main.controller;

import com.ui.main.model.dto.*;
import com.ui.main.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/verify-identity")
    public Mono<Map<String,Object>> verify(@Valid @RequestBody Mono<VerifyReq> body) {
        return body.flatMap(b -> auth.verifyIdentity(b.getEmail(), b.getDni()))
                .map(ok -> Map.of("ok", ok));
    }

    @PostMapping("/signup")
    public Mono<Map<String,Object>> signup(@Valid @RequestBody Mono<SignupReq> body) {
        return body.flatMap(b -> auth.signup(b.getEmail(), b.getDni(), b.getPassword()))
                .thenReturn(Map.of("ok", true));
    }

    @PostMapping("/login")
    public Mono<TokenRes> login(@Valid @RequestBody Mono<LoginReq> body) {
        return body.flatMap(b -> auth.login(b.getEmail(), b.getPassword()))
                .map(TokenRes::new);
    }

    @PostMapping("/reset-password")
    public Mono<Map<String, Object>> resetPassword(@Valid @RequestBody Mono<ResetPasswordReq> body) {
        return body
                .flatMap(b -> auth.resetPassword(b.getEmail(), b.getDni(), b.getNewPassword()))
                .thenReturn(Map.of("ok", true));
    }
}