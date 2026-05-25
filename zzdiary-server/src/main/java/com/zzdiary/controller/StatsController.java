package com.zzdiary.controller;

import com.zzdiary.model.dto.HeatmapPoint;
import com.zzdiary.model.dto.StatsOverview;
import com.zzdiary.model.dto.TimeDistributionPoint;
import com.zzdiary.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<StatsOverview> overview() {
        return ResponseEntity.ok(statsService.getOverview());
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<HeatmapPoint>> heatmap(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(statsService.getHeatmap(from, to));
    }

    @GetMapping("/time-distribution")
    public ResponseEntity<List<TimeDistributionPoint>> timeDistribution() {
        return ResponseEntity.ok(statsService.getTimeDistribution());
    }
}
