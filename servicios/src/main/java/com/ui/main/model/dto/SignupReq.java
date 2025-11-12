package com.ui.main.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupReq {
    @NotBlank
    private String email;
    @NotBlank
    private String dni;
    @NotBlank
    @Size(min = 8)
    private String password;
}