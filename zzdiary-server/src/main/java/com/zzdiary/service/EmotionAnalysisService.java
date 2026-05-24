package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.dto.AnalyzeResponse;
import com.zzdiary.model.dto.EmotionDistribution;
import com.zzdiary.model.dto.TrendPoint;
import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.model.entity.EmotionInsight;
import com.zzdiary.repository.DiaryRepository;
import com.zzdiary.repository.EmotionInsightRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmotionAnalysisService {

    private final DiaryRepository diaryRepository;
    private final EmotionInsightRepository emotionInsightRepository;
    private final EncryptionService encryptionService;

    public EmotionAnalysisService(DiaryRepository diaryRepository,
                                  EmotionInsightRepository emotionInsightRepository,
                                  EncryptionService encryptionService) {
        this.diaryRepository = diaryRepository;
        this.emotionInsightRepository = emotionInsightRepository;
        this.encryptionService = encryptionService;
    }

    /** Aggregate emotion trend by date within a range using persisted AI results. */
    public List<TrendPoint> getTrend(String from, String to) {
        List<DiaryEntry> entries = diaryRepository.findByDateRange(from, to);
        if (entries.isEmpty()) {
            return List.of();
        }

        // Build date lookup: entryId → diary date
        Map<Long, String> entryDates = new HashMap<>();
        for (DiaryEntry entry : entries) {
            String date = entry.createdAt().atZone(ZoneId.systemDefault()).toLocalDate().toString();
            entryDates.put(entry.id(), date);
        }

        // Fetch all insights for these entries
        List<Long> entryIds = new ArrayList<>(entryDates.keySet());
        List<EmotionInsight> allInsights = emotionInsightRepository.findAllByEntryIds(entryIds);
        if (allInsights.isEmpty()) {
            return List.of();
        }

        // Group insights by diary date
        Map<String, List<EmotionInsight>> byDate = new LinkedHashMap<>();
        for (EmotionInsight insight : allInsights) {
            String date = entryDates.get(insight.entryId());
            if (date != null) {
                byDate.computeIfAbsent(date, k -> new ArrayList<>()).add(insight);
            }
        }

        List<TrendPoint> trend = new ArrayList<>();
        for (var entry : byDate.entrySet()) {
            String date = entry.getKey();
            List<EmotionInsight> dayInsights = entry.getValue();

            Map<String, Long> emotionCount = dayInsights.stream()
                    .collect(Collectors.groupingBy(EmotionInsight::emotionType, Collectors.counting()));
            String dominant = emotionCount.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("平静");

            double avgIntensity = dayInsights.stream()
                    .mapToInt(EmotionInsight::intensity)
                    .average()
                    .orElse(0);

            trend.add(new TrendPoint(date, dominant, Math.round(avgIntensity * 10.0) / 10.0));
        }
        return trend;
    }

    /** Count emotion tag occurrences across all analyzed entries. */
    public List<EmotionDistribution> getDistribution() {
        List<EmotionInsight> insights = emotionInsightRepository.findAll();
        if (insights.isEmpty()) {
            return List.of();
        }

        Map<String, Integer> counts = new LinkedHashMap<>();
        for (EmotionInsight insight : insights) {
            counts.merge(insight.emotionType(), 1, Integer::sum);
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(e -> new EmotionDistribution(e.getKey(), e.getValue()))
                .toList();
    }

    /** Get AI analysis result for a single entry from persisted data. */
    public AnalyzeResponse getByEntryId(Long entryId) {
        List<EmotionInsight> insights = emotionInsightRepository.findAllByEntryIds(List.of(entryId));

        if (insights.isEmpty()) {
            throw new RuntimeException("该日记尚未进行 AI 分析，请先点击分析按钮");
        }

        List<String> emotionTags = insights.stream()
                .map(EmotionInsight::emotionType)
                .distinct()
                .toList();

        EmotionInsight first = insights.get(0);
        String rootCause = new String(
                encryptionService.decrypt(first.possibleRootCause()), StandardCharsets.UTF_8);

        return new AnalyzeResponse(
                entryId,
                emotionTags,
                first.intensity(),
                List.of(),
                rootCause,
                first.familyConnection() == 1,
                first.mindfulnessSuggestion()
        );
    }
}
