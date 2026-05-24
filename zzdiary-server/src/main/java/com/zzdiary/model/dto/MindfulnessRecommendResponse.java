package com.zzdiary.model.dto;

public record MindfulnessRecommendResponse(
    Long id,
    String exerciseType,
    String recommendationText,
    String createdAt
) {}
