package com.app.servicefinder.repository;
 
import com.app.servicefinder.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByReceiverId(Long receiverId);
    List<Contact> findBySenderId(Long senderId);
    List<Contact> findByReceiverIdAndIsReadFalse(Long receiverId);
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}