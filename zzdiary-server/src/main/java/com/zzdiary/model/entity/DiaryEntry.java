package com.zzdiary.model.entity;

import java.time.Instant;

public record DiaryEntry(
    Long id,
    byte[] content,
    String mode,
    String emotionTags,
    Integer emotionIntensity,
    Long familyInsightId,
    Instant createdAt,
    Instant updatedAt
) {}
