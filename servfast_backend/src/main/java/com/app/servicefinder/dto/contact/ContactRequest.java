package com.app.servicefinder.dto.contact;
 
import jakarta.validation.constraints.*;
import lombok.Data;
 
@Data
public class ContactRequest {
    @NotBlank @Size(max = 2000)
    private String message;
 
    @NotNull
    private Long receiverId;
 
    private Long serviceId;
}