package com.ui.main.model.dto;

import com.ui.main.repository.entity.UserEntity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserMeRes {
    private Long id;
    private String email;
    private String dni;
    private String name;
    private String genero;
    private Integer edad;
    private LocalDate fechaNacimiento;

    private String phone;
    private String telefono;
    private String celular;

    private String emailPersonal;
    private String ciudadResidencia;
    private String subregion;
    private String tipoDocumentoId;
    private String enfoqueDiferencial;
    private String programa;
    private String nivel;

    private Integer avatarId;
    private String role;

    public static UserMeRes of(UserEntity u) {
        return UserMeRes.builder()
                .id(u.getId()).email(u.getEmail()).dni(u.getDni())
                .name(u.getName()).genero(u.getGenero()).edad(u.getEdad())
                .fechaNacimiento(u.getFechaNacimiento())
                .phone(u.getCelular()).telefono(u.getTelefono()).celular(u.getCelular())
                .emailPersonal(u.getEmailPersonal()).ciudadResidencia(u.getCiudadResidencia())
                .subregion(u.getSubregion()).tipoDocumentoId(u.getTipoDocumentoId())
                .enfoqueDiferencial(u.getEnfoqueDiferencial())
                .programa(u.getPrograma()).nivel(u.getNivel())
                .avatarId(u.getAvatarId()).role(u.getRole())
                .build();
    }
}