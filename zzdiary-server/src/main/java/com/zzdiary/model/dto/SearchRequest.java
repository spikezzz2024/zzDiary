package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotBlank;

public record SearchRequest(@NotBlank String query) {}
