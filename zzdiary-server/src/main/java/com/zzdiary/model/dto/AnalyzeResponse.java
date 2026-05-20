package com.zzdiary.model.dto;

import java.util.List;

public record AnalyzeResponse(
    Long entryId,
    List<String> emotionTags,
    Integer intensity,
    List<String> cognitiveBiases,
    String possibleRootCause,
    Boolean familyConnection,
    String mindfulnessSuggestion
) {}
