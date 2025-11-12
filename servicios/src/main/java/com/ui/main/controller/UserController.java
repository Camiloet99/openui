package com.ui.main.controller;

import com.ui.main.model.dto.UpdateUserReq;
import com.ui.main.model.dto.UserMeRes;
import com.ui.main.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService users;

    @GetMapping("/me")
    public Mono<UserMeRes> me(Mono<Authentication> auth) {
        return auth.map(a -> (String) a.getPrincipal())
                .flatMap(users::getByEmail)
                .map(UserMeRes::of);
    }

    @PutMapping("/me")
    public Mono<UserMeRes> updateMe(Mono<Authentication> auth,
                                    @RequestBody Mono<UpdateUserReq> body) {
        return auth.map(a -> (String) a.getPrincipal())
                .zipWith(body.defaultIfEmpty(new UpdateUserReq()))
                .flatMap(t -> users.patchUser(t.getT1(), t.getT2()))
                .map(UserMeRes::of);
    }
}
