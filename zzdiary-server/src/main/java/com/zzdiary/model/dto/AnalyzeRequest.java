package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotBlank;

public record AnalyzeRequest(@NotBlank String content) {}
