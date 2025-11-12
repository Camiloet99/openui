package com.ui.main.repository;

import com.ui.main.repository.entity.UserProgressEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserProgressRepository extends ReactiveCrudRepository<UserProgressEntity, Long> {
    Mono<UserProgressEntity> findByEmailIgnoreCase(String email);

    Mono<Boolean> existsByEmailIgnoreCase(String email);
}
