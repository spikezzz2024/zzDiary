package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotBlank;

public record FamilyBackgroundRequest(
    @NotBlank String childhoodSummary,
    String parentalRelationship,
    @NotBlank String significantEvents
) {}
