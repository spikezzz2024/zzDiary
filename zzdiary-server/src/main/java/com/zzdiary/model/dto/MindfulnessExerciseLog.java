package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotNull;

public record MindfulnessExerciseLog(
    @NotNull Long exerciseId,
    Integer durationSeconds,
    String userContent
) {}
