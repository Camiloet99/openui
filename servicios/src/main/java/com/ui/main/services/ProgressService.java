package com.ui.main.services;

import com.ui.main.model.dto.ProgressMeRes;
import com.ui.main.repository.UserRepository;
import com.ui.main.repository.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ExternalProgressService external;
    private final UserRepository users;

    public Mono<ProgressMeRes> getMyProgress(String email) {
        return users.findByEmailIgnoreCase(email)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                .flatMap(u -> external.readAll()
                        .map(list -> toRes(u, findByDni(list, u.getDni())))
                );
    }

    public Mono<ProgressMeRes> updateMedals(String email,
                                            Boolean m1, Boolean m2, Boolean m3, Boolean m4) {
        return users.findByEmailIgnoreCase(email)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                .flatMap(u -> external.readAll()
                        // usa flatMap y no retornes null
                        .flatMap(list -> {
                            var curr = findByDni(list, u.getDni()); // puede ser null
                            boolean nm1 = m1 != null ? m1 : (curr != null && curr.isMedalla1());
                            boolean nm2 = m2 != null ? m2 : (curr != null && curr.isMedalla2());
                            boolean nm3 = m3 != null ? m3 : (curr != null && curr.isMedalla3());
                            boolean nm4 = m4 != null ? m4 : (curr != null && curr.isMedalla4());

                            return external.upsertMedals(u.getDni(), nm1, nm2, nm3, nm4)
                                    .flatMap(ok -> {
                                        if (!ok) {
                                            return Mono.error(new ResponseStatusException(
                                                    HttpStatus.BAD_GATEWAY, "No se pudo actualizar medallas en nivel99"));
                                        }
                                        return Mono.just(new ProgressMeRes(
                                                nm1, nm2, nm3, nm4,
                                                bool(u.getInitialTestDone()),
                                                bool(u.getExitTestDone())
                                        ));
                                    });
                        })
                );
    }

    private static ExternalProgressService.UserProgressDto findByDni(
            List<ExternalProgressService.UserProgressDto> list, String dni) {
        if (dni == null) return null;
        String ndni = dni.trim();
        return list.stream()
                .filter(p -> ndni.equals(p.getIdEstudiante()))
                .findFirst()
                .orElse(null);
    }

    public Mono<Void> markTestDone(String email, String kind) {
        return users.findByEmailIgnoreCase(email)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                .flatMap(u -> {
                    if ("test-inicial".equalsIgnoreCase(kind)) {
                        u.setInitialTestDone(true);
                    } else if ("test-salida".equalsIgnoreCase(kind)) {
                        u.setExitTestDone(true);
                    } else {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "kind inválido"));
                    }
                    return users.save(u).then();
                });
    }

    private static boolean bool(Boolean b) {
        return b != null && b;
    }

    private static ProgressMeRes toRes(UserEntity u, ExternalProgressService.UserProgressDto p) {
        boolean m1 = p != null && p.isMedalla1();
        boolean m2 = p != null && p.isMedalla2();
        boolean m3 = p != null && p.isMedalla3();
        boolean m4 = p != null && p.isMedalla4();
        return new ProgressMeRes(
                m1, m2, m3, m4,
                bool(u.getInitialTestDone()),
                bool(u.getExitTestDone())
        );
    }
}