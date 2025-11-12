package com.ui.main.model.dto;

import lombok.Data;

@Data
public class UpdateUserReq {
    private String name;
    private String phone;
    private Integer avatarId;
}