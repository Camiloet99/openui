package com.ui.main.repository.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("user_progress")
public class UserProgressEntity {
    @Id
    private Long id;

    @Column("user_id")
    private Long userId;

    private String email;

    private Boolean medalla1;
    private Boolean medalla2;
    private Boolean medalla3;
    private Boolean medalla4;

    @Column("test_initial_done")
    private Boolean testInitialDone;

    @Column("test_exit_done")
    private Boolean testExitDone;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}