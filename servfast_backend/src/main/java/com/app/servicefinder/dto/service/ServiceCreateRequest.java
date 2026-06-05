package com.app.servicefinder.dto.service;
 
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
 
@Data
public class ServiceCreateRequest {
    @NotBlank(message = "Titre requis")
    private String title;
 
    @Size(max = 2000)
    private String description;
 
    private Double price;
 
    @Pattern(regexp = "FIXED|HOURLY|QUOTE", message = "Type de prix invalide")
    private String priceType;
 
    private String city;
    private Double latitude;
    private Double longitude;
    private Long categoryId;
    private List<String> photoUrls;
}