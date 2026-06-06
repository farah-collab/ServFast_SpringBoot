package com.app.servicefinder.service;

import com.app.servicefinder.dto.message.*;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    /**
     * Send a message: find-or-create the Conversation, then persist the Message.
     */
    @Transactional
    public MessageResponseDTO sendMessage(Long senderId, MessageRequest request) {
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
            .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Find or create conversation
        Conversation conversation = conversationRepository
            .findByParticipants(senderId, request.getReceiverId())
            .orElseGet(() -> conversationRepository.save(
                Conversation.builder()
                    .user1(sender)
                    .user2(receiver)
                    .build()
            ));

        Message message = Message.builder()
            .conversation(conversation)
            .sender(sender)
            .receiver(receiver)
            .content(request.getContent())
            .isRead(false)
            .build();

        message = messageRepository.saveAndFlush(message);

        // Update conversation's last message info
        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toDTO(message);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDTO> getConversation(Long userId, Long partnerId) {
        return messageRepository.findConversation(userId, partnerId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<MessageResponseDTO> getConversationAndMarkRead(Long userId, Long partnerId) {
        List<Message> messages = messageRepository.findConversation(userId, partnerId);
        messages.stream()
            .filter(m -> m.getReceiver().getId().equals(userId) && !m.getIsRead())
            .forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(messages);
        return messages.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findAllByUserId(userId);
        return conversations.stream().map(conv -> {
            User partner = conv.getUser1().getId().equals(userId) ? conv.getUser2() : conv.getUser1();
            Long unread = messageRepository.countBySender_IdAndReceiver_IdAndIsReadFalse(
                partner.getId(), userId);
            String firstName = partner.getFirstName() != null ? partner.getFirstName() : "";
            String lastName = partner.getLastName() != null ? partner.getLastName() : "";
            String participantName = (firstName.trim() + " " + lastName.trim()).trim();
            if (participantName.isEmpty()) {
                participantName = "User " + partner.getId();
            }
            return ConversationDTO.builder()
                .participantId(partner.getId())
                .participantName(participantName)
                .participantPhoto(partner.getProfilePhoto())
                .lastMessage(conv.getLastMessage() != null ? conv.getLastMessage() : "")
                .lastMessageAt(conv.getLastMessageAt())
                .unreadCount(unread)
                .build();
        }).collect(Collectors.toList());
    }

    private MessageResponseDTO toDTO(Message m) {
        String senderFirstName = m.getSender().getFirstName() != null ? m.getSender().getFirstName() : "";
        String senderLastName = m.getSender().getLastName() != null ? m.getSender().getLastName() : "";
        String senderName = (senderFirstName.trim() + " " + senderLastName.trim()).trim();
        if (senderName.isEmpty()) {
            senderName = "User " + m.getSender().getId();
        }
        
        String receiverFirstName = m.getReceiver().getFirstName() != null ? m.getReceiver().getFirstName() : "";
        String receiverLastName = m.getReceiver().getLastName() != null ? m.getReceiver().getLastName() : "";
        String receiverName = (receiverFirstName.trim() + " " + receiverLastName.trim()).trim();
        if (receiverName.isEmpty()) {
            receiverName = "User " + m.getReceiver().getId();
        }
        
        return MessageResponseDTO.builder()
            .id(m.getId())
            .senderId(m.getSender().getId())
            .senderName(senderName)
            .senderPhoto(m.getSender().getProfilePhoto())
            .receiverId(m.getReceiver().getId())
            .receiverName(receiverName)
            .content(m.getContent())
            .isRead(m.getIsRead())
            .sentAt(m.getSentAt())
            .build();
    }
}