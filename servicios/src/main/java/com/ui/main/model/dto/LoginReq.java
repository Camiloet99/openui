package com.ui.main.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginReq {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}