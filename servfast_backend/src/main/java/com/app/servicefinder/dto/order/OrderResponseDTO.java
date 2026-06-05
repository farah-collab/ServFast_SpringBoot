package com.app.servicefinder.dto.order;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private Long serviceId;
    private String serviceTitle;
    private Double servicePrice;
    private Long clientId;
    private String clientName;
    private String clientPhoto;
    private Long providerId;
    private String providerName;
    private String status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}