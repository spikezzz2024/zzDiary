package com.zzdiary.controller;

import com.zzdiary.model.dto.AnalyzeResponse;
import com.zzdiary.model.dto.EmotionDistribution;
import com.zzdiary.model.dto.TrendPoint;
import com.zzdiary.service.EmotionAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emotion")
public class EmotionController {

    private final EmotionAnalysisService emotionAnalysisService;

    public EmotionController(EmotionAnalysisService emotionAnalysisService) {
        this.emotionAnalysisService = emotionAnalysisService;
    }

    @GetMapping("/trend")
    public ResponseEntity<List<TrendPoint>> getTrend(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(emotionAnalysisService.getTrend(from, to));
    }

    @GetMapping("/distribution")
    public ResponseEntity<List<EmotionDistribution>> getDistribution() {
        return ResponseEntity.ok(emotionAnalysisService.getDistribution());
    }

    @GetMapping("/{entryId}")
    public ResponseEntity<AnalyzeResponse> getByEntryId(@PathVariable Long entryId) {
        return ResponseEntity.ok(emotionAnalysisService.getByEntryId(entryId));
    }
}
