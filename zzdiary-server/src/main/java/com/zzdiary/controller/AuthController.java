package com.zzdiary.controller;

import com.zzdiary.model.dto.SetupRequest;
import com.zzdiary.model.dto.UnlockRequest;
import com.zzdiary.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/status")
    public ResponseEntity<AuthService.StatusResponse> status() {
        return ResponseEntity.ok(authService.status());
    }

    @PostMapping("/setup")
    public ResponseEntity<Map<String, Object>> setup(@RequestBody @Valid SetupRequest request) {
        return ResponseEntity.ok(authService.setup(request));
    }

    @PostMapping("/unlock")
    public ResponseEntity<Map<String, Object>> unlock(@RequestBody @Valid UnlockRequest request) {
        return ResponseEntity.ok(authService.unlock(request));
    }

    @PostMapping("/lock")
    public ResponseEntity<Map<String, String>> lock() {
        authService.lock();
        return ResponseEntity.ok(Map.of("message", "已锁定"));
    }
}
