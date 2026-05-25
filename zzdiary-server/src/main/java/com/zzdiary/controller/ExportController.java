package com.zzdiary.controller;

import com.zzdiary.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/diaries")
    public ResponseEntity<byte[]> exportDiaries(
            @RequestParam(defaultValue = "markdown") String format,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        if (!"markdown".equals(format) && !"json".equals(format)) {
            return ResponseEntity.badRequest().build();
        }

        String content = "json".equals(format)
                ? exportService.exportJson(from, to)
                : exportService.exportMarkdown(from, to);

        byte[] bytes = content.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + exportService.getFilename(format) + "\"")
                .contentType(MediaType.parseMediaType(exportService.getContentType(format)))
                .body(bytes);
    }
}
