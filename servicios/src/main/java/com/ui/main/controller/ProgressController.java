package com.ui.main.controller;

import com.ui.main.model.dto.*;
import com.ui.main.services.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progress;

    @GetMapping("/me")
    public Mono<ProgressMeRes> me(Mono<Authentication> auth) {
        return auth.map(a -> (String) a.getPrincipal())
                .flatMap(progress::getMyProgress);
    }

    @PatchMapping("/me/medals")
    public Mono<ProgressMeRes> patchMedals(Mono<Authentication> auth,
                                           @RequestBody Mono<MedalsPatchReq> body) {
        return auth.map(a -> (String) a.getPrincipal())
                .zipWith(body.defaultIfEmpty(new MedalsPatchReq(null, null, null, null)))
                .flatMap(t -> progress.updateMedals(
                        t.getT1(), t.getT2().medalla1(), t.getT2().medalla2(), t.getT2().medalla3(), t.getT2().medalla4()
                ));
    }

    @PostMapping("/me/tests")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> submitTest(Mono<Authentication> auth,
                                 @RequestBody Mono<TestSubmitReq> body) {
        return auth.map(a -> (String) a.getPrincipal())
                .zipWith(body)
                .flatMap(t -> progress.markTestDone(t.getT1(), t.getT2().kind()))
                .then();
    }

    @GetMapping("/all")
    public Mono<PagedUsersWithExperienceStatusRes> getUsersWithExperienceStatusPage(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        return progress.getUsersExperienceStatusPage(page, size);
    }

    @GetMapping("/all/export")
    public Flux<UserWithExperienceStatusRes> getAllUsersWithExperienceStatus() {
        return progress.getAllUsersExperienceStatus();
    }
}