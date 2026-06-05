package com.app.servicefinder.service;
 
import com.app.servicefinder.dto.contact.*;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class ContactService {
 
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final NotificationService notificationService;
 
    public ContactResponseDTO send(Long senderId, ContactRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));
 
        com.app.servicefinder.model.Service service = null;
        if (request.getServiceId() != null) {
            service = serviceRepository.findById(request.getServiceId()).orElse(null);
        }
 
        Contact contact = Contact.builder()
                .message(request.getMessage())
                .sender(sender)
                .receiver(receiver)
                .service(service)
                .isRead(false)
                .build();
        Contact saved = contactRepository.save(contact);

        // Notifier le destinataire
        notificationService.createNotification(
            receiver.getId(),
            sender.getFullName() + " vous a envoyé un message",
            "MESSAGE"
        );

        return mapToDTO(saved);
    }
 
    public void markAsRead(Long contactId, Long userId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        if (!contact.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Non autorisé");
        }
        contact.setIsRead(true);
        contactRepository.save(contact);
    }
 
    public List<ContactResponseDTO> getInbox(Long userId) {
        return contactRepository.findByReceiverId(userId)
                .stream().map(this::mapToDTO).toList();
    }
 
    public List<ContactResponseDTO> getSent(Long userId) {
        return contactRepository.findBySenderId(userId)
                .stream().map(this::mapToDTO).toList();
    }
 
    public long getUnreadCount(Long userId) {
        return contactRepository.countByReceiverIdAndIsReadFalse(userId);
    }
 
    private ContactResponseDTO mapToDTO(Contact c) {
        return ContactResponseDTO.builder()
                .id(c.getId())
                .message(c.getMessage())
                .isRead(c.getIsRead())
                .senderId(c.getSender().getId())
                .senderName(c.getSender().getFullName())
                .senderPhoto(c.getSender().getProfilePhoto())
                .receiverId(c.getReceiver().getId())
                .serviceId(c.getService() != null ? c.getService().getId() : null)
                .serviceTitle(c.getService() != null ? c.getService().getTitle() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}