package com.app.servicefinder.dto.payment;
 
import lombok.*;
 
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponseDTO {
    private String paymentIntentId;
    private String clientSecret;  // Pour Stripe frontend
    private String status;
    private Double amount;
    private String currency;
}