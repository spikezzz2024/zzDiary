package com.zzdiary.infrastructure.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

public class OllamaClient {

    private final RestClient restClient;

    public OllamaClient(String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public record ChatMessage(String role, String content) {}

    public record ChatRequest(
            String model,
            List<ChatMessage> messages,
            boolean stream
    ) {}

    public record ChatResponse(String message, @JsonProperty("done") boolean done) {
        // Maps from { "message": {"role":"assistant","content":"..."}, "done": true }
        @JsonProperty("message")
        public void unpackMessage(Map<String, String> msg) {
            // handled by Jackson, this is for the flattened accessor
        }
    }

    /** Full response wrapper matching Ollama's JSON shape. */
    private record OllamaChatResponse(Map<String, String> message, boolean done) {}

    public String chat(String model, String systemPrompt, String userMessage) {
        var request = new ChatRequest(
                model,
                List.of(
                        new ChatMessage("system", systemPrompt),
                        new ChatMessage("user", userMessage)
                ),
                false
        );

        var response = restClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OllamaChatResponse.class);

        if (response == null || response.message() == null) {
            throw new RuntimeException("Ollama 返回空响应");
        }

        return response.message().getOrDefault("content", "");
    }

    /** Check if Ollama is reachable. */
    public boolean isAvailable() {
        try {
            restClient.get().uri("/api/tags").retrieve().toBodilessEntity();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /** Start pulling a model (non-blocking in practice, but this is synchronous). */
    public void pullModel(String model) {
        restClient.post()
                .uri("/api/pull")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("name", model, "stream", false))
                .retrieve()
                .toBodilessEntity();
    }
}
