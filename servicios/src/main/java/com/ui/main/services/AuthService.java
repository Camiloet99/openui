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
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RosterService roster;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    // =========================
    //  Validadores de formato
    // =========================

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private static final Pattern DNI_PATTERN = Pattern.compile("^[0-9]{5,15}$");

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    private boolean isValidDni(String dni) {
        return dni != null && DNI_PATTERN.matcher(dni).matches();
    }

    /**
     * AHORA: verifyIdentity solo valida FORMATO de email y cédula.
     * Ya no consulta el roster.
     */
    public Mono<Boolean> verifyIdentity(String email, String dni) {
        String norm = email == null ? null : email.trim().toLowerCase();

        if (!isValidEmail(norm)) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Correo electrónico inválido"
            ));
        }

        if (!isValidDni(dni)) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Número de documento inválido"
            ));
        }

        return Mono.just(true);
    }

    // =========================
    //  RESET PASSWORD
    // =========================

    public Mono<Void> resetPassword(String email, String dni, String newRawPassword) {
        String norm = email.toLowerCase();

        if (newRawPassword.length() < 8) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Contraseña insegura (mínimo 8 caracteres)"
            ));
        }

        return verifyIdentity(norm, dni)
                .then(users.findByEmailIgnoreCase(norm)
                        .switchIfEmpty(Mono.error(new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Cuenta no registrada"
                        ))))
                .flatMap(u -> {
                    if (!dni.equals(u.getDni())) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.BAD_REQUEST, "No coincide email/cédula"
                        ));
                    }

                    if (!Boolean.TRUE.equals(u.getEnabled())) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT, "Cuenta deshabilitada"
                        ));
                    }

                    u.setPasswordHash(encoder.encode(newRawPassword));
                    return users.save(u).then();
                });
    }

    // =========================
    //  SIGNUP FLEXIBLE
    // =========================

    public Mono<Void> signup(String email, String dni, String rawPassword) {
        String norm = email.toLowerCase();

        if (rawPassword.length() < 8) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Contraseña insegura (mínimo 8 caracteres)"
            ));
        }

        return verifyIdentity(norm, dni)
                .then(users.existsByEmailIgnoreCase(norm))
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT, "Cuenta ya registrada"
                        ));
                    }
                    return Mono.just(true);
                })
                .then(users.existsByDni(dni))
                .flatMap(dniExists -> {
                    if (dniExists) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.CONFLICT, "Documento ya registrado"
                        ));
                    }
                    return Mono.just(true);
                })
                .then(
                        roster.findByInstitutionalEmail(norm)
                                .map(r -> buildUserFromRoster(r, rawPassword))
                                .switchIfEmpty(Mono.defer(() ->
                                        Mono.just(buildUserForUnknown(norm, dni, rawPassword))
                                ))
                )
                .flatMap(users::save)
                .then();
    }

    // =========================
    //  Helpers de construcción
    // =========================

    private UserEntity buildUserFromRoster(RosterRow r, String rawPassword) {
        return UserEntity.builder()
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
    }

    /**
     * Usuario cuando NO está en el roster.
     * Dejamos campos que no conocemos en null o valores por defecto.
     */
    private UserEntity buildUserForUnknown(String email, String dni, String rawPassword) {
        return UserEntity.builder()
                .email(email)
                .dni(dni)
                .name(email)
                .avatarId(0)
                .passwordHash(encoder.encode(rawPassword))
                .role("USER")
                .enabled(true)
                .initialTestDone(false)
                .exitTestDone(false)
                .build();
    }

    // =========================
    //  LOGIN (igual que antes)
    // =========================

    public Mono<String> login(String email, String password) {
        String norm = email.toLowerCase();
        return users.findByEmailIgnoreCase(norm)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Credenciales inválidas"
                )))
                .flatMap(u -> {
                    if (!Boolean.TRUE.equals(u.getEnabled())
                            || !encoder.matches(password, u.getPasswordHash())) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "Credenciales inválidas"
                        ));
                    }
                    var claims = Map.<String, Object>of(
                            "uid", u.getId(),
                            "role", u.getRole(),
                            "avatarId", u.getAvatarId()
                    );
                    return Mono.just(jwt.generate(u.getEmail(), claims));
                });
    }
}