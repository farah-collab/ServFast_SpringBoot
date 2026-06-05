package com.app.servicefinder.controller;

import com.app.servicefinder.dto.service.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;
    private final JwtUtil jwtUtil;

    @GetMapping("/search")
    public ResponseEntity<List<ServiceResponseDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double maxPrice) {
        return ResponseEntity.ok(serviceService.search(keyword, city, categoryId, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ServiceResponseDTO>> getMyServices(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(serviceService.getByUser(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceResponseDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(serviceService.getByUser(userId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ServiceResponseDTO>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(serviceService.getByCategory(categoryId));
    }

    @PostMapping
    public ResponseEntity<ServiceResponseDTO> create(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ServiceCreateRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceService.create(userId, request));
    }

    // NEW: update a service
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> update(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ServiceCreateRequest request) {
        Long userId = getCurrentUserId(token);
        return ResponseEntity.ok(serviceService.updateService(id, userId, request));
    }
 
    private Long getCurrentUserId(String token) {
        return jwtUtil.extractUserId(token.substring(7));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        serviceService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}