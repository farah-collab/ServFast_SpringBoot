package com.app.servicefinder.dto.auth;
 
import com.app.servicefinder.dto.user.UserResponseDTO;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private UserResponseDTO user;
}