package com.app.servicefinder.repository;

import com.app.servicefinder.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find existing conversation between two users (order-independent).
     * JOIN FETCH user1 and user2 to avoid lazy-loading null names.
     */
    @Query("""
        SELECT c FROM Conversation c
        JOIN FETCH c.user1
        JOIN FETCH c.user2
        WHERE (c.user1.id = :userId1 AND c.user2.id = :userId2)
           OR (c.user1.id = :userId2 AND c.user2.id = :userId1)
        """)
    Optional<Conversation> findByParticipants(
        @Param("userId1") Long userId1,
        @Param("userId2") Long userId2
    );

    /**
     * Find all conversations for a user.
     * JOIN FETCH forces Hibernate to load user1 and user2 immediately
     * — prevents firstName/lastName from returning null.
     */
    @Query("""
        SELECT c FROM Conversation c
        JOIN FETCH c.user1
        JOIN FETCH c.user2
        WHERE c.user1.id = :userId OR c.user2.id = :userId
        ORDER BY c.lastMessageAt DESC NULLS LAST
        """)
    List<Conversation> findAllByUserId(@Param("userId") Long userId);
}