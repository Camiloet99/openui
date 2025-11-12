package com.ui.main.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.roster")
@Data
public class RosterProperties {
    private String csvPath;
    private String delimiter = ",";
    private String charset = "UTF-8";
    private Cols cols = new Cols();

    @Data
    public static class Cols {
        private String ciudadResidencia;
        private String subregion;
        private String name;
        private String tipoDocumentoId;
        private String dni;
        private String fechaNacimiento;
        private String edad;
        private String genero;
        private String telefono;
        private String celular;
        private String emailPersonal;
        private String emailInstitutional;
        private String enfoqueDiferencial;
        private String programa;
        private String nivel;
        private String admin;
    }
}