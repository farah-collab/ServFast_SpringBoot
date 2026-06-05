package com.app.servicefinder.dto.rating;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RatingResponseDTO {
    private Long id;
    private Long serviceId;
    private Long userId;
    private String userName;
    private String userPhoto;
    private Integer score;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}