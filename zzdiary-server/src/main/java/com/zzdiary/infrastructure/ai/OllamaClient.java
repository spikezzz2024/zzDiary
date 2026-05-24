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

    /** Generate embedding vector for the given text using the specified model. */
    @SuppressWarnings("unchecked")
    public float[] embed(String model, String text) {
        var response = restClient.post()
                .uri("/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("model", model, "prompt", text))
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("embedding")) {
            throw new RuntimeException("Ollama 嵌入返回空响应，请确认已拉取嵌入模型: ollama pull " + model);
        }

        var embeddingList = (List<Number>) response.get("embedding");
        float[] floats = new float[embeddingList.size()];
        for (int i = 0; i < embeddingList.size(); i++) {
            floats[i] = embeddingList.get(i).floatValue();
        }
        return floats;
    }

    /** Get list of pulled model names from Ollama. */
    @SuppressWarnings("unchecked")
    public List<String> listModelNames() {
        var response = restClient.get()
                .uri("/api/tags")
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("models")) {
            return List.of();
        }
        var models = (List<Map<String, Object>>) response.get("models");
        return models.stream()
                .map(m -> (String) m.get("name"))
                .toList();
    }

    /** Check if a specific model (or partial name match) is available locally. */
    public boolean isModelPulled(String modelName) {
        return listModelNames().stream()
                .anyMatch(name -> name.startsWith(modelName));
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
