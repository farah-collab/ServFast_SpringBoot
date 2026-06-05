package com.app.servicefinder.controller;

import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        Long adminId = jwtUtil.extractUserId(token.substring(7));
        adminService.deleteUser(adminId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        Long adminId = jwtUtil.extractUserId(token.substring(7));
        adminService.deleteService(adminId, id);
        return ResponseEntity.noContent().build();
    }
}
