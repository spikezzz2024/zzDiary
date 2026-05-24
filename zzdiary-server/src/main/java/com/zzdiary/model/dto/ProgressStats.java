package com.zzdiary.model.dto;

public record ProgressStats(
    int totalCompleted,
    int currentStreak,
    int totalDurationSeconds,
    int breathingCount,
    int gratitudeCount,
    int awarenessCount
) {}
