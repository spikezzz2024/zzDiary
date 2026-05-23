package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotBlank;

public record SaveRequest(@NotBlank String content) {}
