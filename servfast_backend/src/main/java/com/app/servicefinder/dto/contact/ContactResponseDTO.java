package com.app.servicefinder.dto.contact;
 
import lombok.*;
import java.time.LocalDateTime;
 
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ContactResponseDTO {
    private Long id;
    private String message;
    private Boolean isRead;
    private Long senderId;
    private String senderName;
    private String senderPhoto;
    private Long receiverId;
    private Long serviceId;
    private String serviceTitle;
    private LocalDateTime createdAt;
}