package com.zzdiary.model.entity;

import java.time.Instant;

public record EmotionInsight(
    Long id,
    Long entryId,
    String emotionType,
    Integer intensity,
    byte[] possibleRootCause,
    Integer familyConnection,
    String mindfulnessSuggestion,
    Instant createdAt
) {}
