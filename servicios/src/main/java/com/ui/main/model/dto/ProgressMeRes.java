package com.ui.main.model.dto;

public record ProgressMeRes(
        boolean medalla1,
        boolean medalla2,
        boolean medalla3,
        boolean medalla4,
        boolean testInitialDone,
        boolean testExitDone
) {}