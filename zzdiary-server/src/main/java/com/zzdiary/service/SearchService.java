package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.dto.SearchResult;
import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.repository.DiaryRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class SearchService {

    private static final int TOP_K = 20;
    private static final int SNIPPET_LENGTH = 80;

    private final EmbeddingService embeddingService;
    private final VectorIndexManager vectorIndex;
    private final DiaryRepository diaryRepository;
    private final EncryptionService encryptionService;

    public SearchService(EmbeddingService embeddingService, VectorIndexManager vectorIndex,
                         DiaryRepository diaryRepository, EncryptionService encryptionService) {
        this.embeddingService = embeddingService;
        this.vectorIndex = vectorIndex;
        this.diaryRepository = diaryRepository;
        this.encryptionService = encryptionService;
    }

    public List<SearchResult> search(String query) {
        if (vectorIndex.size() == 0) {
            return List.of();
        }

        float[] queryEmbedding = embeddingService.generateEmbedding(query);
        var scored = vectorIndex.search(queryEmbedding, TOP_K);

        List<SearchResult> results = new ArrayList<>();
        for (var r : scored) {
            diaryRepository.findById(r.entryId()).ifPresent(entry -> {
                String snippet = decryptSnippet(entry);
                results.add(new SearchResult(
                        entry.id(),
                        snippet,
                        Math.round(r.score() * 100.0) / 100.0,
                        parseTags(entry.emotionTags()),
                        entry.createdAt().toString()
                ));
            });
        }
        return results;
    }

    private String decryptSnippet(DiaryEntry entry) {
        try {
            String content = new String(
                    encryptionService.decrypt(entry.content()), StandardCharsets.UTF_8);
            if (content.length() <= SNIPPET_LENGTH) {
                return content;
            }
            return content.substring(0, SNIPPET_LENGTH) + "...";
        } catch (Exception e) {
            return "(解密失败)";
        }
    }

    /** Returns model status info for the frontend. */
    public Map<String, Object> getModelStatus() {
        Map<String, Object> status = new java.util.LinkedHashMap<>();
        status.put("modelName", embeddingService.getModelName());
        status.put("modelSizeMB", embeddingService.getModelSizeMB());
        status.put("ollamaAvailable", embeddingService.isOllamaAvailable());
        status.put("modelPulled", embeddingService.isModelAvailable());
        status.put("indexedCount", vectorIndex.size());
        return status;
    }

    /** Pull the embedding model (blocking, may take minutes). */
    public void pullModel() {
        embeddingService.pullModel();
    }

    private List<String> parseTags(String tagsJson) {
        if (tagsJson == null || tagsJson.isBlank()) {
            return List.of();
        }
        return Arrays.stream(
                tagsJson.replaceAll("[\\[\\]\"]", "").split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
