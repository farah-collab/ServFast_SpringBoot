package com.app.servicefinder.controller;

import com.app.servicefinder.dto.rating.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final JwtUtil jwtUtil;

    // POST /api/ratings — create or update rating
    @PostMapping
    public ResponseEntity<RatingResponseDTO> createOrUpdate(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody RatingRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(ratingService.createOrUpdate(userId, request));
    }

    // GET /api/ratings/service/{serviceId} — public
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<RatingResponseDTO>> getByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(ratingService.getByService(serviceId));
    }

    // GET /api/ratings/service/{serviceId}/stats
    @GetMapping("/service/{serviceId}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long serviceId) {
        return ResponseEntity.ok(Map.of(
            "average", ratingService.getAverageScore(serviceId),
            "count", ratingService.getCount(serviceId)
        ));
    }

    // GET /api/ratings/my — my ratings
    @GetMapping("/my")
    public ResponseEntity<List<RatingResponseDTO>> getMyRatings(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(ratingService.getByUser(userId));
    }

    // DELETE /api/ratings/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        ratingService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/recent")
    public ResponseEntity<List<RatingResponseDTO>> getRecent() {
        return ResponseEntity.ok(ratingService.getRecentWithComment(20));
}
}