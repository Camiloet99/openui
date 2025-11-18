package com.ui.main.model.dto;

import com.ui.main.repository.entity.UserEntity;

public record UserWithExperienceStatusRes(
        Long id,
        String email,
        String dni,
        String name,
        Boolean enabled,
        int experienceStatus,      // <- ahora es int
        String subregion,
        String genero,
        Integer edad,
        String enfoqueDiferencial,
        String nivel,
        String programa,
        String municipio
) {
    public static UserWithExperienceStatusRes of(UserEntity u, int experienceStatus) {
        return new UserWithExperienceStatusRes(
                u.getId(),
                u.getEmail(),
                u.getDni(),
                u.getName(),
                u.getEnabled(),
                experienceStatus,
                u.getSubregion(),
                u.getGenero(),
                u.getEdad(),
                u.getEnfoqueDiferencial(),
                u.getNivel(),
                u.getPrograma(),
                u.getCiudadResidencia()
        );
    }
}
