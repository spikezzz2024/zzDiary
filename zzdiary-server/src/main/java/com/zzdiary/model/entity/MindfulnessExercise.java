package com.zzdiary.model.entity;

import java.time.Instant;

public record MindfulnessExercise(
    Long id,
    String exerciseType,
    String recommendationText,
    String userContent,
    Integer durationSeconds,
    Integer completed,
    String completedAt,
    Instant createdAt,
    Instant updatedAt
) {}
