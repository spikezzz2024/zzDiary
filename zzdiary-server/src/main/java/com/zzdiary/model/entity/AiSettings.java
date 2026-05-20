package com.zzdiary.model.entity;

public record AiSettings(
    Long id,
    String mode,
    String deepseekApiKey,
    String ollamaModel,
    String ollamaBaseUrl
) {}
