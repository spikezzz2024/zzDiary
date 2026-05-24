package com.zzdiary.model.entity;

public record DiaryEmbedding(
        Long id,
        Long entryId,
        byte[] embedding,
        String model,
        int dimension,
        String createdAt
) {}
