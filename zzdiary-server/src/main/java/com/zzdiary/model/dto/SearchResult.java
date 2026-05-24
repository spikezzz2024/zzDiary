package com.zzdiary.model.dto;

import java.util.List;

public record SearchResult(
        Long id,
        String snippet,
        double score,
        List<String> emotionTags,
        String createdAt
) {}
