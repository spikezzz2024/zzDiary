package com.zzdiary.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zzdiary.model.dto.AnalyzeResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final String SYSTEM_PROMPT = """
            你是一位温和、非评判的正念日记分析助手。你的任务是对用户的日记内容进行情绪分析。

            请严格按以下 JSON 格式返回分析结果（不要包含其他文字，只返回 JSON）：
            {
              "emotionTags": ["情绪1", "情绪2"],
              "intensity": 数字1-10,
              "cognitiveBiases": ["认知偏差1"],
              "possibleRootCause": "可能的根本原因分析",
              "familyConnection": true或false,
              "mindfulnessSuggestion": "正念练习建议"
            }

            规则：
            - emotionTags 列出检测到的情绪，如：焦虑、愤怒、羞耻、喜悦、悲伤、恐惧、平静、困惑、内疚、孤独
            - intensity 为整体情绪强度 1-10
            - cognitiveBiases 识别可能的认知偏差：灾难化、读心术、非黑即白、过度概括、情绪推理、应该思维、贴标签、个人化
            - possibleRootCause 用温和语气推测情绪来源，使用"可能"、"或许"等开放性措辞
            - familyConnection 若内容涉及家庭/童年/父母关系则为 true
            - mindfulnessSuggestion 推荐一个有针对性正念练习
            """;

    private final AiConfigService aiConfigService;
    private final ObjectMapper objectMapper;

    public AiService(AiConfigService aiConfigService, ObjectMapper objectMapper) {
        this.aiConfigService = aiConfigService;
        this.objectMapper = objectMapper;
    }

    public AnalyzeResponse analyze(String sanitizedContent) {
        var settings = aiConfigService.get();

        if ("deepseek".equals(settings.mode())) {
            String apiKey = settings.deepseekApiKey();
            if (apiKey == null || apiKey.isBlank()) {
                return fallbackAnalyze(sanitizedContent, "未配置 DeepSeek API Key，显示本地规则分析结果");
            }
            try {
                var deepSeek = new com.zzdiary.infrastructure.ai.DeepSeekClient(apiKey, "deepseek-chat");
                String raw = deepSeek.chat(SYSTEM_PROMPT, sanitizedContent);
                return parseResponse(raw);
            } catch (Exception e) {
                return fallbackAnalyze(sanitizedContent, "AI 服务暂时不可用，显示本地规则分析结果");
            }
        } else {
            if (!aiConfigService.createOllamaClient().isAvailable()) {
                return fallbackAnalyze(sanitizedContent, "Ollama 未运行，显示本地规则分析结果");
            }
            try {
                var ollama = aiConfigService.createOllamaClient();
                String raw = ollama.chat(settings.ollamaModel(), SYSTEM_PROMPT, sanitizedContent);
                return parseResponse(raw);
            } catch (Exception e) {
                return fallbackAnalyze(sanitizedContent, "AI 服务暂时不可用，显示本地规则分析结果");
            }
        }
    }

    /** Rule-based fallback when no AI backend is available. */
    private AnalyzeResponse fallbackAnalyze(String content, String note) {
        List<String> tags = detectEmotions(content);
        int intensity = estimateIntensity(content);
        List<String> biases = detectBiases(content);
        boolean family = hasFamilyKeywords(content);

        return new AnalyzeResponse(
                null,
                tags,
                intensity,
                biases,
                note + "。根据内容关键词推测：你可能正在经历一些"
                        + (tags.isEmpty() ? "复杂的" : String.join("、", tags))
                        + "情绪。建议连接 DeepSeek API 或启动 Ollama 获得更精准的 AI 分析。",
                family,
                tags.contains("焦虑") ? "尝试 4-7-8 呼吸法：吸气4秒，屏息7秒，缓慢呼气8秒，重复5次，帮助平静神经系统。"
                        : tags.contains("愤怒") ? "尝试'暂停-观察-选择'练习：停下手边的事情，观察身体感受30秒，再选择如何回应。"
                        : tags.contains("悲伤") ? "给自己一些温柔的空间。试着写下三件今天让你感到一丝温暖的小事。"
                        : "每天写下三件值得感恩的小事，持续一周，可以帮助提升情绪的基线水平。"
        );
    }

    private List<String> detectEmotions(String text) {
        List<String> found = new java.util.ArrayList<>();
        if (text.contains("焦虑") || text.contains("紧张") || text.contains("担心") || text.contains("不安")) found.add("焦虑");
        if (text.contains("愤怒") || text.contains("生气") || text.contains("讨厌") || text.contains("烦")) found.add("愤怒");
        if (text.contains("悲伤") || text.contains("难过") || text.contains("伤心") || text.contains("哭")) found.add("悲伤");
        if (text.contains("恐惧") || text.contains("害怕")) found.add("恐惧");
        if (text.contains("羞耻") || text.contains("丢脸")) found.add("羞耻");
        if (text.contains("开心") || text.contains("高兴") || text.contains("快乐") || text.contains("喜悦")) found.add("喜悦");
        if (text.contains("平静") || text.contains("放松")) found.add("平静");
        if (text.contains("困惑") || text.contains("迷茫") || text.contains("不知道")) found.add("困惑");
        if (text.contains("孤独") || text.contains("寂寞")) found.add("孤独");
        if (text.contains("内疚") || text.contains("自责") || text.contains("后悔")) found.add("内疚");
        if (text.contains("累") || text.contains("疲惫") || text.contains("倦")) found.add("疲惫");
        if (found.isEmpty()) found.add("困惑");
        return found;
    }

    private int estimateIntensity(String text) {
        int score = 5;
        if (text.contains("非常") || text.contains("极其") || text.contains("受不了") || text.contains("崩溃")) score += 2;
        if (text.contains("很") || text.contains("特别") || text.contains("太")) score += 1;
        if (text.contains("一点") || text.contains("稍微") || text.contains("有点")) score -= 2;
        return Math.clamp(score, 1, 10);
    }

    private List<String> detectBiases(String text) {
        List<String> found = new java.util.ArrayList<>();
        if (text.contains("永远") || text.contains("从来") || text.contains("总是") || text.contains("从未")) found.add("过度概括");
        if (text.contains("一定") || text.contains("肯定") || text.contains("绝对")) found.add("非黑即白");
        if (text.contains("最坏") || text.contains("完蛋") || text.contains("毁") || text.contains("糟糕")) found.add("灾难化");
        if (text.contains("觉得别人") || text.contains("他们都") || text.contains("别人会")) found.add("读心术");
        if (text.contains("我应该") || text.contains("必须") || text.contains("不得不")) found.add("应该思维");
        if (text.contains("怪我") || text.contains("是我的错") || text.contains("都是我")) found.add("个人化");
        return found;
    }

    private boolean hasFamilyKeywords(String text) {
        return text.contains("妈妈") || text.contains("爸爸") || text.contains("父母")
                || text.contains("家庭") || text.contains("小时候") || text.contains("童年")
                || text.contains("家里") || text.contains("父亲") || text.contains("母亲");
    }

    @SuppressWarnings("unchecked")
    private AnalyzeResponse parseResponse(String raw) {
        try {
            String json = raw.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("```\\w*\\n?", "").replaceAll("```$", "").trim();
            }
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            return new AnalyzeResponse(
                    null,
                    (List<String>) map.getOrDefault("emotionTags", List.of()),
                    map.get("intensity") instanceof Number n ? n.intValue() : 5,
                    (List<String>) map.getOrDefault("cognitiveBiases", List.of()),
                    (String) map.getOrDefault("possibleRootCause", ""),
                    (Boolean) map.getOrDefault("familyConnection", false),
                    (String) map.getOrDefault("mindfulnessSuggestion", "")
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("AI 响应解析失败: " + raw, e);
        }
    }
}
