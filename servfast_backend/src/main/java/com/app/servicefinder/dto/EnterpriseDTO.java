package com.app.servicefinder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseDTO {

    private Long id;
    private String name;
    private String description;
    private String city;
    private String sector;
    private String logoUrl;
    private String imageUrl;
    private String websiteUrl;
    private Integer employeeCount;
}