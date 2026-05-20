package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.dto.AnalyzeRequest;
import com.zzdiary.model.dto.AnalyzeResponse;
import com.zzdiary.model.dto.DiaryEntryDto;
import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.model.entity.EmotionInsight;
import com.zzdiary.repository.DiaryRepository;
import com.zzdiary.repository.EmotionInsightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Service
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final EmotionInsightRepository emotionInsightRepository;
    private final EncryptionService encryptionService;
    private final AiService aiService;

    public DiaryService(DiaryRepository diaryRepository,
                        EmotionInsightRepository emotionInsightRepository,
                        EncryptionService encryptionService,
                        AiService aiService) {
        this.diaryRepository = diaryRepository;
        this.emotionInsightRepository = emotionInsightRepository;
        this.encryptionService = encryptionService;
        this.aiService = aiService;
    }

    @Transactional
    public AnalyzeResponse analyze(AnalyzeRequest request) {
        String sanitized = sanitize(request.content());
        AnalyzeResponse aiResponse = aiService.analyze(sanitized);

        byte[] encryptedContent = encryptionService.encrypt(
                request.content().getBytes(StandardCharsets.UTF_8)
        );

        String emotionTagsJson = aiResponse.emotionTags() != null
                ? "[\"" + String.join("\",\"", aiResponse.emotionTags()) + "\"]"
                : null;

        DiaryEntry entry = diaryRepository.save(new DiaryEntry(
                null, encryptedContent, "free",
                emotionTagsJson,
                aiResponse.intensity(),
                null, null, null
        ));

        byte[] encryptedRootCause = aiResponse.possibleRootCause() != null
                ? encryptionService.encrypt(aiResponse.possibleRootCause().getBytes(StandardCharsets.UTF_8))
                : null;

        emotionInsightRepository.save(new EmotionInsight(
                null, entry.id(),
                aiResponse.emotionTags() != null && !aiResponse.emotionTags().isEmpty()
                        ? aiResponse.emotionTags().getFirst() : "未知",
                aiResponse.intensity(),
                encryptedRootCause,
                aiResponse.familyConnection() != null && aiResponse.familyConnection() ? 1 : 0,
                aiResponse.mindfulnessSuggestion(),
                null
        ));

        return new AnalyzeResponse(
                entry.id(),
                aiResponse.emotionTags(),
                aiResponse.intensity(),
                aiResponse.cognitiveBiases(),
                aiResponse.possibleRootCause(),
                aiResponse.familyConnection(),
                aiResponse.mindfulnessSuggestion()
        );
    }

    public DiaryEntryDto findById(Long id) {
        DiaryEntry entry = diaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("日记不存在: " + id));
        return toDto(entry);
    }

    public List<DiaryEntryDto> list(int page, int size) {
        int offset = page * size;
        return diaryRepository.findAll(size, offset).stream()
                .map(this::toDto)
                .toList();
    }

    public void delete(Long id) {
        int deleted = diaryRepository.deleteById(id);
        if (deleted == 0) {
            throw new RuntimeException("日记不存在: " + id);
        }
    }

    private DiaryEntryDto toDto(DiaryEntry entry) {
        String decryptedContent = new String(
                encryptionService.decrypt(entry.content()), StandardCharsets.UTF_8);
        List<String> tags = entry.emotionTags() != null
                ? Arrays.stream(entry.emotionTags()
                        .replaceAll("[\\[\\]\"]", "")
                        .split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
                : List.of();
        return new DiaryEntryDto(entry.id(), decryptedContent, entry.mode(), tags, entry.emotionIntensity(), entry.createdAt());
    }

    /** Remove PII before sending to AI. */
    private String sanitize(String content) {
        return content
                .replaceAll("\\b[A-Z][a-z]+ [A-Z][a-z]+\\b", "[姓名]")
                .replaceAll("1[3-9]\\d{9}", "[手机号]")
                .replaceAll("\\d{6}(\\d{8})", "[身份证]");
    }
}
