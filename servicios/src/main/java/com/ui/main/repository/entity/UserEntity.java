package com.ui.main.repository.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Table("users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    private Long id;

    private String email;
    private String dni;

    private String name;
    private String genero;
    private Integer edad;

    @Column("fecha_nacimiento")
    private LocalDate fechaNacimiento;

    private String telefono;
    private String celular;

    private String emailPersonal;
    private String ciudadResidencia;
    private String subregion;
    private String tipoDocumentoId;
    private String enfoqueDiferencial;
    private String programa;
    private String nivel;

    @Column("avatar_id")
    private Integer avatarId;

    @Column("password_hash")
    private String passwordHash;

    private String role;
    private Boolean enabled;

    // NUEVO -> deben existir en DB como initial_test_done / exit_test_done
    @Column("initial_test_done")
    private Boolean initialTestDone;

    @Column("exit_test_done")
    private Boolean exitTestDone;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
