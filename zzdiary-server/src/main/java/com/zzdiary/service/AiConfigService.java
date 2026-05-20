package com.zzdiary.service;

import com.zzdiary.infrastructure.ai.OllamaClient;
import com.zzdiary.model.entity.AiSettings;
import com.zzdiary.repository.AiSettingsRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AiConfigService {

    private final AiSettingsRepository repository;
    private final AiSettings defaults = new AiSettings(null, "ollama", null, "qwen2.5:7b", "http://localhost:11434");

    public AiConfigService(AiSettingsRepository repository) {
        this.repository = repository;
    }

    public AiSettings get() {
        return repository.find().orElse(defaults);
    }

    public AiSettings update(Map<String, String> updates) {
        AiSettings current = get();
        AiSettings updated = new AiSettings(
                current.id(),
                updates.getOrDefault("mode", current.mode()),
                updates.getOrDefault("deepseekApiKey", current.deepseekApiKey()),
                updates.getOrDefault("ollamaModel", current.ollamaModel()),
                updates.getOrDefault("ollamaBaseUrl", current.ollamaBaseUrl())
        );
        return repository.save(updated);
    }

    public OllamaClient createOllamaClient() {
        return new OllamaClient(get().ollamaBaseUrl());
    }
}
