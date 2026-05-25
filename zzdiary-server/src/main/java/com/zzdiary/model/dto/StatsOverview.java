package com.zzdiary.model.dto;

public record StatsOverview(
    int totalEntries,
    int totalChars,
    int avgCharsPerEntry,
    int activeDays,
    int currentStreak,
    int longestStreak
) {}
