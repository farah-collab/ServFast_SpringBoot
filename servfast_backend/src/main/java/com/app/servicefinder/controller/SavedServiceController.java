package com.app.servicefinder.controller;
 
import com.app.servicefinder.dto.service.ServiceResponseDTO;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.SavedServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/saved")
@RequiredArgsConstructor
public class SavedServiceController {
 
    private final SavedServiceService savedServiceService;
    private final JwtUtil jwtUtil;
 
    // GET /api/saved
    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> getSaved(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(savedServiceService.getSaved(userId));
    }
 
    // POST /api/saved/{serviceId}
    @PostMapping("/{serviceId}")
    public ResponseEntity<Void> save(
            @PathVariable Long serviceId,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        savedServiceService.save(userId, serviceId);
        return ResponseEntity.ok().build();
    }
 
    // DELETE /api/saved/{serviceId}
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Void> unsave(
            @PathVariable Long serviceId,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        savedServiceService.unsave(userId, serviceId);
        return ResponseEntity.noContent().build();
    }
 
    // GET /api/saved/{serviceId}/check
    @GetMapping("/{serviceId}/check")
    public ResponseEntity<Map<String, Boolean>> isSaved(
            @PathVariable Long serviceId,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(Map.of("saved", savedServiceService.isSaved(userId, serviceId)));
    }
}