package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.dto.AnalyzeRequest;
import com.zzdiary.model.dto.AnalyzeResponse;
import com.zzdiary.model.dto.DiaryEntryDto;
import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.repository.DiaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final EncryptionService encryptionService;
    private final AiService aiService;

    public DiaryService(DiaryRepository diaryRepository,
                        EncryptionService encryptionService,
                        AiService aiService) {
        this.diaryRepository = diaryRepository;
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

        DiaryEntry entry = diaryRepository.save(new DiaryEntry(
                null, encryptedContent, "free",
                null, null, null, null, null
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

    /** Save or update today's diary entry. One entry per day — re-save overwrites. */
    @Transactional
    public DiaryEntryDto saveToday(String content) {
        byte[] encryptedContent = encryptionService.encrypt(
                content.getBytes(StandardCharsets.UTF_8));
        String today = LocalDate.now().toString();

        var existing = diaryRepository.findTodayEntry(today);
        DiaryEntry entry;
        if (existing.isPresent()) {
            diaryRepository.updateContent(existing.get().id(), encryptedContent);
            entry = new DiaryEntry(
                    existing.get().id(), encryptedContent, existing.get().mode(),
                    existing.get().emotionTags(), existing.get().emotionIntensity(),
                    existing.get().familyInsightId(), existing.get().createdAt(),
                    java.time.Instant.now());
        } else {
            entry = diaryRepository.save(new DiaryEntry(
                    null, encryptedContent, "free",
                    null, null, null, null, null));
        }
        return toDto(entry);
    }

    /** Analyze an existing diary entry without persisting results. */
    public AnalyzeResponse analyzeExisting(Long id) {
        DiaryEntry entry = diaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("日记不存在: " + id));
        String content = new String(
                encryptionService.decrypt(entry.content()), StandardCharsets.UTF_8);
        return aiService.analyze(sanitize(content));
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

    public List<DiaryEntryDto> findByDate(String date) {
        return diaryRepository.findByDate(date).stream()
                .map(this::toDto)
                .toList();
    }

    public List<String> getDatesWithEntries() {
        return diaryRepository.findDistinctDates();
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
