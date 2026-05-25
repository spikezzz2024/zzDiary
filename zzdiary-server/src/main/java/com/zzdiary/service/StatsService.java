package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.dto.HeatmapPoint;
import com.zzdiary.model.dto.StatsOverview;
import com.zzdiary.model.dto.TimeDistributionPoint;
import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.repository.DiaryRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final DiaryRepository diaryRepository;
    private final EncryptionService encryptionService;

    public StatsService(DiaryRepository diaryRepository, EncryptionService encryptionService) {
        this.diaryRepository = diaryRepository;
        this.encryptionService = encryptionService;
    }

    public StatsOverview getOverview() {
        List<DiaryEntry> entries = diaryRepository.findAllEntries();
        int totalEntries = entries.size();
        int totalChars = 0;

        for (DiaryEntry entry : entries) {
            String content = new String(
                    encryptionService.decrypt(entry.content()), StandardCharsets.UTF_8);
            totalChars += countChars(content);
        }

        int avgCharsPerEntry = totalEntries > 0 ? totalChars / totalEntries : 0;
        List<String> dates = diaryRepository.findDistinctDates();
        int activeDays = dates.size();
        int[] streaks = computeStreaks(dates);

        return new StatsOverview(totalEntries, totalChars, avgCharsPerEntry,
                activeDays, streaks[0], streaks[1]);
    }

    public List<HeatmapPoint> getHeatmap(String from, String to) {
        if (from == null || from.isEmpty()) {
            from = "2000-01-01";
        }
        if (to == null || to.isEmpty()) {
            to = LocalDate.now().toString();
        }
        List<Map<String, Object>> rows = diaryRepository.countByDateRange(from, to);
        List<HeatmapPoint> result = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            String date = row.get("entry_date").toString();
            int count = ((Number) row.get("cnt")).intValue();
            result.add(new HeatmapPoint(date, count));
        }
        return result;
    }

    public List<TimeDistributionPoint> getTimeDistribution() {
        List<Map<String, Object>> rows = diaryRepository.getHourDistribution();
        List<TimeDistributionPoint> result = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            int hour = ((Number) row.get("hour")).intValue();
            int count = ((Number) row.get("cnt")).intValue();
            result.add(new TimeDistributionPoint(hour, count));
        }
        return result;
    }

    private int countChars(String text) {
        int count = 0;
        for (int i = 0; i < text.length(); i++) {
            if (!Character.isWhitespace(text.charAt(i))) {
                count++;
            }
        }
        return count;
    }

    private int[] computeStreaks(List<String> dates) {
        if (dates.isEmpty()) {
            return new int[]{0, 0};
        }
        // dates are sorted DESC (most recent first)
        List<LocalDate> sorted = dates.stream()
                .map(LocalDate::parse)
                .sorted()
                .toList();

        int longestStreak = 1;
        int currentRun = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).minusDays(1).equals(sorted.get(i - 1))) {
                currentRun++;
            } else {
                longestStreak = Math.max(longestStreak, currentRun);
                currentRun = 1;
            }
        }
        longestStreak = Math.max(longestStreak, currentRun);

        LocalDate mostRecent = sorted.get(sorted.size() - 1);
        LocalDate today = LocalDate.now();
        int currentStreak = 0;
        if (mostRecent.equals(today) || mostRecent.equals(today.minusDays(1))) {
            currentStreak = 1;
            for (int i = sorted.size() - 2; i >= 0; i--) {
                if (sorted.get(i + 1).minusDays(1).equals(sorted.get(i))) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        return new int[]{currentStreak, longestStreak};
    }
}
