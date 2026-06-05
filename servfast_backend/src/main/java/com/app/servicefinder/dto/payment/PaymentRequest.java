package com.app.servicefinder.dto.payment;
 
import jakarta.validation.constraints.*;
import lombok.Data;
 
@Data
public class PaymentRequest {
    @NotNull
    private Long serviceId;
 
    @NotNull @Positive
    private Double amount;
 
    @NotBlank
    private String currency; // TND, EUR, USD
}