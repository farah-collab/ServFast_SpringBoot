package com.app.servicefinder.controller;
 
import com.app.servicefinder.model.Notification;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
 
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
 
    // GET /api/notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAll(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(notificationService.getAll(userId));
    }
 
    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }
 
    // PUT /api/notifications/read-all
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
 
    // GET /api/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }
}