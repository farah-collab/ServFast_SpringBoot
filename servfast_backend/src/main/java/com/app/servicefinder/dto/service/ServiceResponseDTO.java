package com.app.servicefinder.dto.service;
 
import com.app.servicefinder.dto.user.UserResponseDTO;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
 
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ServiceResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String priceType;
    private String city;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable;
    private Integer viewsCount;
    private String categoryName;
    private String categoryIcon;
    private UserResponseDTO provider;
    private Double averageRating;
    private Long totalRatings;
    private List<String> photoUrls;
    private LocalDateTime createdAt;
}