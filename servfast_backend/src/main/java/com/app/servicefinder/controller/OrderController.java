package com.app.servicefinder.controller;

import com.app.servicefinder.dto.order.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    // POST /api/orders — client creates an order
    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody OrderRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(orderService.createOrder(userId, request));
    }

    // GET /api/orders/my — client sees his orders
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(orderService.getClientOrders(userId));
    }

    // GET /api/orders/received — provider sees received orders
    @GetMapping("/received")
    public ResponseEntity<List<OrderResponseDTO>> getReceivedOrders(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(orderService.getProviderOrders(userId));
    }

    // PATCH /api/orders/{id}/status?status=ACCEPTED
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam String status) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(orderService.updateStatus(id, userId, status));
    }
}