package com.ui.main.model.dto;

import java.time.LocalDate;

public record RosterRow(
        String ciudadResidencia,
        String subregion,
        String name,
        String tipoDocumentoId,
        String dni,
        LocalDate fechaNacimiento,
        Integer edad,
        String genero,
        String telefono,
        String celular,
        String emailPersonal,
        String emailInstitutional,
        String enfoqueDiferencial,
        String programa,
        String nivel,
        boolean admin
) {
}