package com.app.servicefinder.dto.user;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String profilePhoto;
    private String bio;
    private String city;
    private String role;
    private Boolean verified;
    private Integer experienceYears;
    private String specialty;
    private LocalDateTime createdAt;
}