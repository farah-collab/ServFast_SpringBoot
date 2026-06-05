package com.app.servicefinder.repository;

import com.app.servicefinder.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // All messages between two users, sorted by date
    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2)
           OR (m.sender.id = :userId2 AND m.receiver.id = :userId1)
        ORDER BY m.sentAt ASC
        """)
    List<Message> findConversation(@Param("userId1") Long userId1,
                                   @Param("userId2") Long userId2);

    // Unread count for a receiver
    Long countByReceiver_IdAndIsReadFalse(Long receiverId);

    // All distinct conversation partners for a user
    @Query("""
        SELECT DISTINCT
            CASE WHEN m.sender.id = :userId THEN m.receiver
                 ELSE m.sender END
        FROM Message m
        WHERE m.sender.id = :userId OR m.receiver.id = :userId
        """)
    List<com.app.servicefinder.model.User> findConversationPartners(@Param("userId") Long userId);

    // Last message between two users
    @Query(value = """
        SELECT * FROM messages m
        WHERE (m.sender_id = :userId1 AND m.receiver_id = :userId2)
           OR (m.sender_id = :userId2 AND m.receiver_id = :userId1)
        ORDER BY m.sent_at DESC
        LIMIT 1
        """, nativeQuery = true)
    java.util.Optional<Message> findLastMessage(@Param("userId1") Long userId1,
                                                @Param("userId2") Long userId2);

    // Unread count between two specific users
    Long countBySender_IdAndReceiver_IdAndIsReadFalse(Long senderId, Long receiverId);
}