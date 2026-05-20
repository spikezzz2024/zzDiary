package com.zzdiary.infrastructure.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;

public class DeepSeekClient {

    private final RestClient restClient;
    private final String model;

    public DeepSeekClient(String apiKey, String model) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.deepseek.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.model = model;
    }

    public record ChatMessage(String role, String content) {}

    public record ChatRequest(
            String model,
            List<ChatMessage> messages,
            double temperature,
            @JsonProperty("max_tokens") int maxTokens
    ) {}

    public record ChatChoice(ChatMessage message) {}

    public record ChatResponse(List<ChatChoice> choices) {}

    public String chat(String systemPrompt, String userMessage) {
        var request = new ChatRequest(
                model,
                List.of(
                        new ChatMessage("system", systemPrompt),
                        new ChatMessage("user", userMessage)
                ),
                0.7,
                1024
        );

        var response = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(ChatResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new RuntimeException("DeepSeek 返回空响应");
        }

        return response.choices().getFirst().message().content();
    }
}
