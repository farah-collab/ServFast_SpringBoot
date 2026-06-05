package com.app.servicefinder.dto.auth;
 
import com.app.servicefinder.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Prénom requis")
    private String firstName;

    @NotBlank(message = "Nom requis")
    private String lastName;

    @Email(message = "Email invalide")
    @NotBlank(message = "Email requis")
    private String email;

    @Size(min = 8, message = "Mot de passe minimum 8 caractères")
    @NotBlank(message = "Mot de passe requis")
    private String password;

    private String phone;
    private String city;
    private User.Role role = User.Role.CLIENT;
}