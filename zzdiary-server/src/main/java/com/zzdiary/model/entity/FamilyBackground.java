package com.zzdiary.model.entity;

import java.time.Instant;

public record FamilyBackground(
    Long id,
    byte[] childhoodSummary,
    String parentalRelationship,
    byte[] significantEvents,
    byte[] skillSummary,
    Instant createdAt,
    Instant updatedAt
) {}
