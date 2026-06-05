package com.app.servicefinder.controller;
 
import com.app.servicefinder.dto.assistant.*;
import com.app.servicefinder.service.AssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {
 
    private final AssistantService assistantService;
 
    // POST /api/assistant/chat
    @PostMapping("/chat")
    public ResponseEntity<AssistantResponse> chat(@RequestBody AssistantRequest request) {
        return ResponseEntity.ok(assistantService.chat(request));
    }
}