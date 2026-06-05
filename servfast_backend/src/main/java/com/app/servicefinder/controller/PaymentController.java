package com.app.servicefinder.controller;
 
import com.app.servicefinder.dto.payment.*;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
 
    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;
 
    // POST /api/payments/create-intent
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponseDTO> createPaymentIntent(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody PaymentRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(paymentService.createPaymentIntent(userId, request));
    }
 
    // POST /api/payments/confirm
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(
            @RequestHeader("Authorization") String token,
            @RequestParam String paymentIntentId) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        paymentService.confirmPayment(userId, paymentIntentId);
        return ResponseEntity.ok().build();
    }
}