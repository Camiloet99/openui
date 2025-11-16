package com.ui.main.model.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PagedUsersWithExperienceStatusRes {
    List<UserWithExperienceStatusRes> userList;
    long totalUsers;
    int page;
    int size;
}