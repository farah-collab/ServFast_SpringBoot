package com.app.servicefinder.controller;

import com.app.servicefinder.dto.user.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // GET /api/users/me
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(userService.getById(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // PUT /api/users/me
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UserUpdateRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    // PATCH /api/users/me/password
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        userService.changePassword(userId, body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    // GET /api/users/experts — list providers with optional keyword search
    @GetMapping("/experts")
    public ResponseEntity<List<UserResponseDTO>> getExperts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getExperts(keyword, page, size));
    }

    // GET /api/users/featured — featured (verified) experts
    @GetMapping("/featured")
    public ResponseEntity<List<UserResponseDTO>> getFeaturedExperts(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(userService.getFeaturedExperts(limit));
    }
}