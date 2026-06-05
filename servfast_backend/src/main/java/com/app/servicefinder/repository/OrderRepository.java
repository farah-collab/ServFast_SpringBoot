package com.app.servicefinder.repository;

import com.app.servicefinder.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClient_IdOrderByCreatedAtDesc(Long clientId);
    List<Order> findByProvider_IdOrderByCreatedAtDesc(Long providerId);
    List<Order> findByService_IdOrderByCreatedAtDesc(Long serviceId);
}