package com.zzdiary.service;

import com.zzdiary.model.dto.MindfulnessExerciseLog;
import com.zzdiary.model.dto.MindfulnessRecommendRequest;
import com.zzdiary.model.dto.MindfulnessRecommendResponse;
import com.zzdiary.model.dto.ProgressStats;
import com.zzdiary.model.entity.EmotionInsight;
import com.zzdiary.model.entity.MindfulnessExercise;
import com.zzdiary.repository.EmotionInsightRepository;
import com.zzdiary.repository.MindfulnessExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MindfulnessService {

    private static final String RECOMMEND_SYSTEM_PROMPT = """
            你是一位温和、非评判的正念冥想导师。请根据用户近期的情绪状态，推荐一个有针对性的正念练习。
            练习类型：%s（呼吸练习/感恩日记/情绪觉察）。

            请严格按以下 JSON 格式返回（不要包含其他文字，只返回 JSON）：
            {
              "recommendationText": "具体的、可操作的练习指导文本"
            }

            要求：
            - 呼吸练习：提供具体呼吸节奏指导（如4-7-8呼吸、盒式呼吸），包含步骤和秒数
            - 感恩日记：提供3个具体的感恩书写提示/主题引导
            - 情绪觉察：提供身体扫描或情绪标注的具体引导步骤
            - 文本长度80-150字
            - 语气温和、非评判
            - 基于用户当前情绪状态进行个性化调整
            只返回JSON，不要包含其他文字。""";

    private final MindfulnessExerciseRepository repository;
    private final EmotionInsightRepository emotionInsightRepository;
    private final AiService aiService;

    public MindfulnessService(MindfulnessExerciseRepository repository,
                               EmotionInsightRepository emotionInsightRepository,
                               AiService aiService) {
        this.repository = repository;
        this.emotionInsightRepository = emotionInsightRepository;
        this.aiService = aiService;
    }

    /** Generate AI recommendation based on recent emotion state. */
    @Transactional
    public MindfulnessRecommendResponse recommend(MindfulnessRecommendRequest request) {
        String exerciseType = request.exerciseType();
        if (exerciseType == null || exerciseType.isBlank()) {
            exerciseType = autoSelectType();
        }

        String emotionSummary = buildEmotionSummary();
        String userPrompt = "用户近期情绪状态：\n" + emotionSummary;
        String systemPrompt = String.format(RECOMMEND_SYSTEM_PROMPT,
                switch (exerciseType) {
                    case "breathing" -> "呼吸练习";
                    case "gratitude" -> "感恩日记";
                    case "emotion_awareness" -> "情绪觉察";
                    default -> "呼吸练习";
                });

        String recommendationText = aiService.generateMindfulnessRecommendation(systemPrompt, userPrompt);

        var now = Instant.now();
        MindfulnessExercise saved = repository.save(new MindfulnessExercise(
                null, exerciseType, recommendationText, null, null, 0, null, now, now));

        return new MindfulnessRecommendResponse(
                saved.id(), saved.exerciseType(), saved.recommendationText(), now.toString());
    }

    /** Log a completed exercise. */
    @Transactional
    public void log(MindfulnessExerciseLog log) {
        var now = Instant.now();
        String completedAt = now.toString();
        int rows = repository.updateCompleted(
                log.exerciseId(),
                log.userContent() != null ? log.userContent() : "",
                log.durationSeconds() != null ? log.durationSeconds() : 0,
                completedAt,
                now.toString());
        if (rows == 0) {
            throw new RuntimeException("正念练习记录不存在: " + log.exerciseId());
        }
    }

    /** Calculate progress statistics. */
    public ProgressStats getProgress() {
        int totalCompleted = repository.countCompleted();

        String to = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String from = LocalDate.now().minusDays(60).format(DateTimeFormatter.ISO_LOCAL_DATE);
        List<MindfulnessExercise> completed = repository.findCompletedBetween(from, to + "T23:59:59");

        int streak = calculateStreak(completed);
        int totalDuration = completed.stream()
                .mapToInt(e -> e.durationSeconds() != null ? e.durationSeconds() : 0)
                .sum();

        int breathingCount = 0, gratitudeCount = 0, awarenessCount = 0;
        for (var e : completed) {
            switch (e.exerciseType()) {
                case "breathing" -> breathingCount++;
                case "gratitude" -> gratitudeCount++;
                case "emotion_awareness" -> awarenessCount++;
            }
        }

        return new ProgressStats(totalCompleted, streak, totalDuration, breathingCount, gratitudeCount, awarenessCount);
    }

    /** Pick an exercise type based on recent dominant emotions. */
    private String autoSelectType() {
        List<EmotionInsight> all = emotionInsightRepository.findAll();
        if (all.isEmpty()) {
            return "breathing";
        }
        // Count emotion occurrences
        Map<String, Long> counts = all.stream()
                .collect(Collectors.groupingBy(EmotionInsight::emotionType, Collectors.counting()));
        String dominant = counts.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse("平静");

        // Map dominant emotion to exercise type
        return switch (dominant) {
            case "焦虑", "恐惧" -> "breathing";
            case "悲伤", "孤独", "失望" -> "gratitude";
            case "困惑", "羞耻", "内疚", "愤怒" -> "emotion_awareness";
            default -> "breathing";
        };
    }

    /** Build a text summary of recent emotions for the AI prompt. */
    private String buildEmotionSummary() {
        List<EmotionInsight> all = emotionInsightRepository.findAll();
        if (all.isEmpty()) {
            return "暂无情绪数据";
        }
        Map<String, Long> counts = all.stream()
                .collect(Collectors.groupingBy(EmotionInsight::emotionType, Collectors.counting()));
        double avgIntensity = all.stream()
                .mapToInt(e -> e.intensity() != null ? e.intensity() : 5)
                .average().orElse(5.0);

        StringBuilder sb = new StringBuilder();
        counts.forEach((emotion, count) ->
                sb.append(emotion).append("(").append(count).append("次)、"));
        sb.setLength(sb.length() - 1); // remove trailing comma
        sb.append(String.format("。整体情绪强度%.1f/10。", avgIntensity));
        return sb.toString();
    }

    /** Calculate consecutive days with at least one completed exercise. */
    private int calculateStreak(List<MindfulnessExercise> completed) {
        if (completed.isEmpty()) {
            return 0;
        }
        var completedDays = completed.stream()
                .map(e -> {
                    String at = e.completedAt();
                    return at != null ? at.substring(0, 10) : "";
                })
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate today = LocalDate.now();
        // Check today first, then count backwards
        for (int i = 0; i < 60; i++) {
            LocalDate d = today.minusDays(i);
            if (completedDays.contains(d.format(DateTimeFormatter.ISO_LOCAL_DATE))) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    }
}
