package com.zzdiary.model.dto;

import java.time.Instant;
import java.util.List;

public record DiaryEntryDto(
    Long id,
    String content,
    String mode,
    List<String> emotionTags,
    Integer emotionIntensity,
    Instant createdAt
) {}
