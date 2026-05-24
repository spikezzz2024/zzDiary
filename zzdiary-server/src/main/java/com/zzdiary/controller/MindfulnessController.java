package com.zzdiary.controller;

import com.zzdiary.model.dto.MindfulnessExerciseLog;
import com.zzdiary.model.dto.MindfulnessRecommendRequest;
import com.zzdiary.model.dto.MindfulnessRecommendResponse;
import com.zzdiary.model.dto.ProgressStats;
import com.zzdiary.service.MindfulnessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mindfulness")
public class MindfulnessController {

    private final MindfulnessService mindfulnessService;

    public MindfulnessController(MindfulnessService mindfulnessService) {
        this.mindfulnessService = mindfulnessService;
    }

    /** Generate a personalized mindfulness exercise recommendation. */
    @PostMapping("/recommend")
    public ResponseEntity<MindfulnessRecommendResponse> recommend(
            @RequestBody MindfulnessRecommendRequest request) {
        return ResponseEntity.ok(mindfulnessService.recommend(
                request != null ? request : new MindfulnessRecommendRequest(null)));
    }

    /** Log completion of a mindfulness exercise. */
    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> log(
            @RequestBody @Valid MindfulnessExerciseLog log) {
        mindfulnessService.log(log);
        return ResponseEntity.ok(Map.of("logged", true));
    }

    /** Get mindfulness exercise progress statistics. */
    @GetMapping("/progress")
    public ResponseEntity<ProgressStats> getProgress() {
        return ResponseEntity.ok(mindfulnessService.getProgress());
    }
}
