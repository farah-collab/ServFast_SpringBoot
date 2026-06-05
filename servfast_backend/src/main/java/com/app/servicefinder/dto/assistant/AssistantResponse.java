package com.app.servicefinder.dto.assistant;
 
import lombok.*;
 
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AssistantResponse {
    private String reply;
    private String conversationId;
    private String suggestedCategory;
    private String suggestedCity;
}