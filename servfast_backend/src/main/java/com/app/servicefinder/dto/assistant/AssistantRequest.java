package com.app.servicefinder.dto.assistant;
 
import lombok.Data;
 
@Data
public class AssistantRequest {
    private String message;
    private String conversationId;
}