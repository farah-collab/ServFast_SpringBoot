package com.app.servicefinder.controller;

import com.app.servicefinder.dto.message.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final JwtUtil jwtUtil;

    // POST /api/messages — send a message
    @PostMapping
    public ResponseEntity<MessageResponseDTO> send(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody MessageRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(messageService.sendMessage(userId, request));
    }

    // GET /api/messages/conversations — list all conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(messageService.getConversations(userId));
    }

    // GET /api/messages/{partnerId} — get conversation with partner (and mark as read)
    @GetMapping("/{partnerId}")
    public ResponseEntity<List<MessageResponseDTO>> getConversation(
            @RequestHeader("Authorization") String token,
            @PathVariable Long partnerId) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(messageService.getConversationAndMarkRead(userId, partnerId));
    }
}