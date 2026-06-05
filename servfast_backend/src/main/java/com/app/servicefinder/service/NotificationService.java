package com.app.servicefinder.service;
 
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class NotificationService {
 
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
 
    public void createNotification(Long userId, String message, String type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        Notification notif = Notification.builder()
                .message(message)
                .type(type)
                .isRead(false)
                .user(user)
                .build();
        notificationRepository.save(notif);
    }
 
    public List<Notification> getAll(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
 
    public void markAsRead(Long notifId, Long userId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        if (!notif.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Non autorisé");
        }
        notif.setIsRead(true);
        notificationRepository.save(notif);
    }
 
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
 
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
 