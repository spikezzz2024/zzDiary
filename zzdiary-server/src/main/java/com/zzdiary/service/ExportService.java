package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.model.entity.EmotionInsight;
import com.zzdiary.repository.DiaryRepository;
import com.zzdiary.repository.EmotionInsightRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExportService {

    private final DiaryRepository diaryRepository;
    private final EmotionInsightRepository emotionInsightRepository;
    private final EncryptionService encryptionService;

    public ExportService(DiaryRepository diaryRepository,
                        EmotionInsightRepository emotionInsightRepository,
                        EncryptionService encryptionService) {
        this.diaryRepository = diaryRepository;
        this.emotionInsightRepository = emotionInsightRepository;
        this.encryptionService = encryptionService;
    }

    /** Export diaries as Markdown string. */
    public String exportMarkdown(String from, String to) {
        List<DiaryEntry> entries = getEntries(from, to);
        if (entries.isEmpty()) {
            return "# zzDiary Export\n\n> No entries found in the selected date range.\n";
        }

        Map<Long, List<EmotionInsight>> insightsByEntry = getInsightsMap(entries);

        StringBuilder sb = new StringBuilder();
        sb.append("# zzDiary 日记导出\n\n");
        sb.append("> 导出日期: ").append(LocalDate.now()).append(" | ");
        sb.append(entries.size()).append(" 篇日记\n\n---\n\n");

        for (DiaryEntry entry : entries) {
            String content = decrypt(entry.content());
            LocalDate date = entry.createdAt().atZone(ZoneId.systemDefault()).toLocalDate();

            sb.append("## ").append(date).append("\n\n");

            if (entry.emotionTags() != null && !entry.emotionTags().isEmpty()) {
                sb.append("**情绪**: ").append(formatTags(entry.emotionTags()));
                if (entry.emotionIntensity() != null) {
                    sb.append(" | **强度**: ").append(entry.emotionIntensity()).append("/10");
                }
                sb.append("\n\n");
            }

            List<EmotionInsight> insights = insightsByEntry.get(entry.id());
            if (insights != null && !insights.isEmpty()) {
                for (EmotionInsight insight : insights) {
                    if (insight.possibleRootCause() != null) {
                        String rootCause = decrypt(insight.possibleRootCause());
                        if (!rootCause.isEmpty()) {
                            sb.append("*").append(insight.emotionType()).append("根源: ").append(rootCause).append("*\n");
                        }
                    }
                    if (insight.mindfulnessSuggestion() != null && !insight.mindfulnessSuggestion().isEmpty()) {
                        sb.append("*正念建议: ").append(insight.mindfulnessSuggestion()).append("*\n");
                    }
                }
                sb.append("\n");
            }

            sb.append(content).append("\n\n---\n\n");
        }

        return sb.toString();
    }

    /** Export diaries as JSON array string. */
    public String exportJson(String from, String to) {
        List<DiaryEntry> entries = getEntries(from, to);
        Map<Long, List<EmotionInsight>> insightsByEntry = getInsightsMap(entries);

        StringBuilder sb = new StringBuilder();
        sb.append("[\n");

        for (int i = 0; i < entries.size(); i++) {
            DiaryEntry entry = entries.get(i);
            String content = decrypt(entry.content());

            sb.append("  {\n");
            sb.append("    \"id\": ").append(entry.id()).append(",\n");
            sb.append("    \"createdAt\": \"").append(entry.createdAt()).append("\",\n");
            sb.append("    \"content\": ").append(jsonEscape(content)).append(",\n");

            if (entry.emotionTags() != null && !entry.emotionTags().isEmpty()) {
                sb.append("    \"emotionTags\": [");
                String tags = entry.emotionTags().replaceAll("[\\[\\]\"]", "");
                String[] tagArr = tags.split(",");
                for (int j = 0; j < tagArr.length; j++) {
                    sb.append("\"").append(tagArr[j].trim()).append("\"");
                    if (j < tagArr.length - 1) sb.append(", ");
                }
                sb.append("],\n");
            } else {
                sb.append("    \"emotionTags\": [],\n");
            }

            sb.append("    \"emotionIntensity\": ").append(entry.emotionIntensity() != null ? entry.emotionIntensity() : "null").append(",\n");

            List<EmotionInsight> insights = insightsByEntry.get(entry.id());
            if (insights != null && !insights.isEmpty()) {
                EmotionInsight first = insights.get(0);
                sb.append("    \"possibleRootCause\": ").append(first.possibleRootCause() != null ? jsonEscape(decrypt(first.possibleRootCause())) : "null").append(",\n");
                sb.append("    \"mindfulnessSuggestion\": ").append(first.mindfulnessSuggestion() != null ? jsonEscape(first.mindfulnessSuggestion()) : "null").append("\n");
            } else {
                sb.append("    \"possibleRootCause\": null,\n");
                sb.append("    \"mindfulnessSuggestion\": null\n");
            }

            sb.append("  }");
            if (i < entries.size() - 1) sb.append(",");
            sb.append("\n");
        }

        sb.append("]\n");
        return sb.toString();
    }

    public String getFilename(String format) {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return "zzdiary-export-" + date + "." + ("json".equals(format) ? "json" : "md");
    }

    public String getContentType(String format) {
        return "json".equals(format) ? "application/json" : "text/markdown; charset=UTF-8";
    }

    private List<DiaryEntry> getEntries(String from, String to) {
        if (from == null || from.isEmpty()) from = "2000-01-01";
        if (to == null || to.isEmpty()) to = LocalDate.now().toString();
        return diaryRepository.findByDateRange(from, to);
    }

    private Map<Long, List<EmotionInsight>> getInsightsMap(List<DiaryEntry> entries) {
        List<Long> entryIds = entries.stream().map(DiaryEntry::id).toList();
        return emotionInsightRepository.findAllByEntryIds(entryIds).stream()
                .collect(Collectors.groupingBy(EmotionInsight::entryId));
    }

    private String decrypt(byte[] encrypted) {
        return new String(encryptionService.decrypt(encrypted), StandardCharsets.UTF_8);
    }

    private String formatTags(String tagsJson) {
        return tagsJson.replaceAll("[\\[\\]\"]", "").replace(",", ", ");
    }

    private String jsonEscape(String s) {
        StringBuilder escaped = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> escaped.append(c);
            }
        }
        escaped.append("\"");
        return escaped.toString();
    }
}
