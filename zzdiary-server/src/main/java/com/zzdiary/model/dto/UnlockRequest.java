package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotBlank;

public record UnlockRequest(@NotBlank String password) {}
