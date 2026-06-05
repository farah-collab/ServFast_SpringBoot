package com.app.servicefinder.service;
 
import com.app.servicefinder.dto.assistant.*;
import com.app.servicefinder.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
 
@Service
@RequiredArgsConstructor
public class AssistantService {
 
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;
 
    @Value("${anthropic.api.key}")
    private String anthropicApiKey;
 
    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
 
    public AssistantResponse chat(AssistantRequest request) {
        // Récupérer les catégories disponibles
        List<String> categories = categoryRepository.findAll()
                .stream().map(c -> c.getName()).collect(java.util.stream.Collectors.toList());
 
        String systemPrompt = """
            Tu es ServBot, l'assistant intelligent de ServFast, une marketplace de services en Tunisie.
            Tu aides les utilisateurs à :
            - Trouver le bon service selon leurs besoins
            - Naviguer dans les catégories disponibles
            - Comprendre comment fonctionne la plateforme
            - Répondre aux questions sur les services
            
            Catégories disponibles sur la plateforme : """ + String.join(", ", categories) + """
            
            Réponds toujours en français, de manière concise et utile.
            Si l'utilisateur cherche un service, propose-lui la bonne catégorie.
            """;
 
        // Appel API Anthropic (Claude)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");
 
        Map<String, Object> body = new HashMap<>();
        body.put("model", "claude-3-haiku-20240307");
        body.put("max_tokens", 500);
        body.put("system", systemPrompt);
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", request.getMessage());
        messages.add(userMessage);

        body.put("messages", messages);
 
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
 
        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity response = restTemplate.postForEntity(ANTHROPIC_API_URL, entity, Map.class);
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody == null) {
                throw new IllegalArgumentException("Empty response from API");
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) responseBody.get("content");
            if (content == null || content.isEmpty()) {
                throw new IllegalArgumentException("No content in response");
            }
            Map<String, Object> firstContent = content.get(0);
            String reply = (String) firstContent.get("text");

            return AssistantResponse.builder()
                    .reply(reply)
                    .conversationId(request.getConversationId() != null ?
                            request.getConversationId() : UUID.randomUUID().toString())
                    .build();
        } catch (Exception e) {
            return AssistantResponse.builder()
                    .reply("Désolé, je ne suis pas disponible pour le moment. Veuillez réessayer.")
                    .build();
        }
    }
}