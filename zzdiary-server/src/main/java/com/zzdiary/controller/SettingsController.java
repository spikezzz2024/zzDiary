package com.zzdiary.controller;

import com.zzdiary.model.entity.AiSettings;
import com.zzdiary.service.AiConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final AiConfigService aiConfigService;

    public SettingsController(AiConfigService aiConfigService) {
        this.aiConfigService = aiConfigService;
    }

    @GetMapping("/ai")
    public ResponseEntity<AiSettings> getAiSettings() {
        return ResponseEntity.ok(aiConfigService.get());
    }

    @PutMapping("/ai")
    public ResponseEntity<AiSettings> updateAiSettings(@RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(aiConfigService.update(updates));
    }

    /** Check if Ollama is reachable and has the configured model. */
    @GetMapping("/ollama/status")
    public ResponseEntity<Map<String, Object>> ollamaStatus() {
        var settings = aiConfigService.get();
        var ollama = aiConfigService.createOllamaClient();
        boolean available = ollama.isAvailable();
        return ResponseEntity.ok(Map.of(
                "available", available,
                "baseUrl", settings.ollamaBaseUrl(),
                "model", settings.ollamaModel()
        ));
    }
}
