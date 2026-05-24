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

    /** Analyze diary content using configured AI backend. */
    public AnalyzeResponse analyze(String sanitizedContent) {
        return analyze(sanitizedContent, null);
    }

    /** Analyze diary content with optional family background context injected into the prompt. */
    public AnalyzeResponse analyze(String sanitizedContent, String familySkill) {
        String prompt = SYSTEM_PROMPT;
        if (familySkill != null && !familySkill.isBlank()) {
            prompt += "\n\n用户的家庭背景参考（请在分析时结合此背景理解用户的情绪模式）：\n" + familySkill;
        }
        String raw = callAi(prompt, sanitizedContent);
        return parseResponse(raw);
    }

    /** Distill family background data into a concise insight skill. Returns plain text. */
    public String distillFamilySkill(String systemPrompt, String userPrompt) {
        return callAi(systemPrompt, userPrompt);
    }

    /** Call AI backend with given prompts and return the raw response string. */
    private String callAi(String systemPrompt, String userMessage) {
        var settings = aiConfigService.get();

        if ("deepseek".equals(settings.mode())) {
            String apiKey = settings.deepseekApiKey();
            if (apiKey == null || apiKey.isBlank()) {
                throw new RuntimeException("未配置 DeepSeek API Key，请在设置页面配置或切换到 Ollama 模式");
            }
            var deepSeek = new com.zzdiary.infrastructure.ai.DeepSeekClient(apiKey, "deepseek-chat");
            return deepSeek.chat(systemPrompt, userMessage);
        } else {
            if (!aiConfigService.createOllamaClient().isAvailable()) {
                throw new RuntimeException("Ollama 未运行，请启动 Ollama 或在设置页面切换到 DeepSeek 模式");
            }
            var ollama = aiConfigService.createOllamaClient();
            return ollama.chat(settings.ollamaModel(), systemPrompt, userMessage);
        }
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
