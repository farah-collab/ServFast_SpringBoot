package com.app.servicefinder.controller;
 
import com.app.servicefinder.dto.contact.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {
 
    private final ContactService contactService;
    private final JwtUtil jwtUtil;
 
    // POST /api/contacts
    @PostMapping
    public ResponseEntity<ContactResponseDTO> send(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ContactRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.send(userId, request));
    }
 
    // GET /api/contacts/inbox
    @GetMapping("/inbox")
    public ResponseEntity<List<ContactResponseDTO>> getInbox(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(contactService.getInbox(userId));
    }
 
    // GET /api/contacts/sent
    @GetMapping("/sent")
    public ResponseEntity<List<ContactResponseDTO>> getSent(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(contactService.getSent(userId));
    }
 
    // PUT /api/contacts/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        contactService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }
 
    // GET /api/contacts/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(Map.of("count", contactService.getUnreadCount(userId)));
    }
}
 