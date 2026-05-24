package com.zzdiary.model.dto;

public record TrendPoint(
    String date,
    String dominantEmotion,
    double avgIntensity
) {}
