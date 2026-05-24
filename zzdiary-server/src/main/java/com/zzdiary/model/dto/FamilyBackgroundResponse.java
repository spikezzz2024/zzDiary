package com.zzdiary.model.dto;

public record FamilyBackgroundResponse(
    Long id,
    String childhoodSummary,
    String parentalRelationship,
    String significantEvents,
    String skillSummary,
    String createdAt,
    String updatedAt
) {}
