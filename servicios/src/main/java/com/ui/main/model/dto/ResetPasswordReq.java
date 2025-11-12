package com.ui.main.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordReq {

    @Email(message = "Email inválido")
    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\d{6,10}$", message = "Cédula inválida (6–10 dígitos)")
    private String dni;

    @NotBlank
    private String newPassword;
}