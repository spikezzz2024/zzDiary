package com.zzdiary.controller;

import com.zzdiary.model.dto.SearchRequest;
import com.zzdiary.model.dto.SearchResult;
import com.zzdiary.service.SearchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping("/semantic")
    public ResponseEntity<List<SearchResult>> semanticSearch(@RequestBody @Valid SearchRequest request) {
        return ResponseEntity.ok(searchService.search(request.query()));
    }

    @GetMapping("/model-status")
    public ResponseEntity<Map<String, Object>> modelStatus() {
        return ResponseEntity.ok(searchService.getModelStatus());
    }

    @PostMapping("/pull-model")
    public ResponseEntity<Map<String, String>> pullModel() {
        try {
            searchService.pullModel();
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
