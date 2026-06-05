package com.app.servicefinder.dto.message;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConversationDTO {
    private Long participantId;
    private String participantName;
    private String participantPhoto;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;
}