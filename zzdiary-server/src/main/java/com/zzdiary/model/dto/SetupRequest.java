package com.zzdiary.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetupRequest(
    @NotBlank String email,
    @NotBlank @Size(min = 6) String password
) {}
