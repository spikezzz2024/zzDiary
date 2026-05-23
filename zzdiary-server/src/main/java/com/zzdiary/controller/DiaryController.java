package com.zzdiary.controller;

import com.zzdiary.model.dto.AnalyzeRequest;
import com.zzdiary.model.dto.AnalyzeResponse;
import com.zzdiary.model.dto.DiaryEntryDto;
import com.zzdiary.model.dto.SaveRequest;
import com.zzdiary.service.DiaryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diary")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @PostMapping("/save")
    public ResponseEntity<DiaryEntryDto> save(@RequestBody @Valid SaveRequest request) {
        return ResponseEntity.ok(diaryService.saveToday(request.content()));
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@RequestBody @Valid AnalyzeRequest request) {
        return ResponseEntity.ok(diaryService.analyze(request));
    }

    @GetMapping("/list")
    public ResponseEntity<List<DiaryEntryDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(diaryService.list(page, size));
    }

    @GetMapping("/dates")
    public ResponseEntity<List<String>> getDates() {
        return ResponseEntity.ok(diaryService.getDatesWithEntries());
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<DiaryEntryDto>> getByDate(@RequestParam String date) {
        return ResponseEntity.ok(diaryService.findByDate(date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaryEntryDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(diaryService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        diaryService.delete(id);
        return ResponseEntity.ok(Map.of("deleted", true, "id", id));
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<AnalyzeResponse> analyzeEntry(@PathVariable Long id) {
        return ResponseEntity.ok(diaryService.analyzeExisting(id));
    }
}
