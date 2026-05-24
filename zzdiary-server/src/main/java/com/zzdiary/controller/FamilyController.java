package com.zzdiary.controller;

import com.zzdiary.model.dto.FamilyBackgroundRequest;
import com.zzdiary.model.dto.FamilyBackgroundResponse;
import com.zzdiary.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping("/background")
    public ResponseEntity<FamilyBackgroundResponse> getBackground() {
        return ResponseEntity.ok(familyService.getBackground());
    }

    @PutMapping("/background")
    public ResponseEntity<FamilyBackgroundResponse> saveBackground(
            @RequestBody @Valid FamilyBackgroundRequest request) {
        return ResponseEntity.ok(familyService.saveBackground(request));
    }

    @PostMapping("/distill")
    public ResponseEntity<Map<String, String>> distill() {
        String skill = familyService.distillSkill();
        return ResponseEntity.ok(Map.of("skillSummary", skill));
    }
}
