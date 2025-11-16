package com.ui.main.services;

import com.ui.main.model.dto.RosterRow;
import com.ui.main.repository.UserRepository;
import com.ui.main.repository.entity.UserEntity;
import com.ui.main.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RosterService roster;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public Mono<Boolean> verifyIdentity(String email, String dni) {
        return roster.matchesEmailAndDni(email, dni);
    }

    public Mono<Void> resetPassword(String email, String dni, String newRawPassword) {
        String norm = email.toLowerCase();

        if (newRawPassword.length() < 8) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contraseña insegura (mínimo 8 caracteres)"));
        }

        return verifyIdentity(norm, dni)
                .flatMap(valid -> {
                    if (!valid) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "No coincide email/cédula"));
                    }
                    return Mono.just(true);
                })
                .then(users.findByEmailIgnoreCase(norm)
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuenta no registrada"))))
                .flatMap(u -> {
                    if (!Boolean.TRUE.equals(u.getEnabled())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Cuenta deshabilitada"));
                    }
                    u.setPasswordHash(encoder.encode(newRawPassword));
                    return users.save(u).then();
                });
    }

    public Mono<Void> signup(String email, String dni, String rawPassword) {
        String norm = email.toLowerCase();
        return verifyIdentity(norm, dni)
                .flatMap(valid -> valid ? Mono.just(true)
                        : Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "No coincide email/cédula")))
                .then(users.existsByEmailIgnoreCase(norm))
                .flatMap(exists -> exists
                        ? Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Cuenta ya registrada"))
                        : Mono.just(true))
                .then(roster.findByInstitutionalEmail(norm)
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hallado en padrón"))))
                .flatMap((RosterRow r) -> {
                    UserEntity u = UserEntity.builder()
                            .email(r.emailInstitutional())
                            .dni(r.dni())
                            .name(r.name())
                            .genero(r.genero())
                            .edad(r.edad())
                            .fechaNacimiento(r.fechaNacimiento())
                            .telefono(r.telefono())
                            .celular(r.celular())
                            .emailPersonal(r.emailPersonal())
                            .ciudadResidencia(r.ciudadResidencia())
                            .subregion(r.subregion())
                            .tipoDocumentoId(r.tipoDocumentoId())
                            .enfoqueDiferencial(r.enfoqueDiferencial())
                            .programa(r.programa())
                            .nivel(r.nivel())
                            .avatarId(0)
                            .passwordHash(encoder.encode(rawPassword))
                            .role(r.admin() ? "ADMIN" : "USER")
                            .enabled(true)
                            .initialTestDone(false)
                            .exitTestDone(false)
                            .build();
                    return users.save(u).then();
                });
    }

    public Mono<String> login(String email, String password) {
        String norm = email.toLowerCase();
        return users.findByEmailIgnoreCase(norm)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas")))
                .flatMap(u -> {
                    if (!Boolean.TRUE.equals(u.getEnabled()) || !encoder.matches(password, u.getPasswordHash())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
                    }
                    var claims = Map.<String, Object>of(
                            "uid", u.getId(), "role", u.getRole(), "avatarId", u.getAvatarId());
                    return Mono.just(jwt.generate(u.getEmail(), claims));
                });
    }
}