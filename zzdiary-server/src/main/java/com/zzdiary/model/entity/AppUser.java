package com.zzdiary.model.entity;

public record AppUser(
    Long id,
    String email,
    String passwordHash,
    byte[] encryptionSalt
) {}
