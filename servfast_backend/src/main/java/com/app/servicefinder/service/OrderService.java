package com.app.servicefinder.service;

import com.app.servicefinder.dto.order.*;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public OrderResponseDTO createOrder(Long clientId, OrderRequest request) {
        User client = userRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found"));

        com.app.servicefinder.model.Service service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new RuntimeException("Service not found"));

        User provider = service.getUser();

        if (provider.getId().equals(clientId)) {
            throw new RuntimeException("You cannot order your own service");
        }

        Order order = Order.builder()
            .client(client)
            .provider(provider)
            .service(service)
            .note(request.getNote())
            .status(Order.OrderStatus.PENDING)
            .build();

        return toDTO(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getClientOrders(Long clientId) {
        return orderRepository.findByClient_IdOrderByCreatedAtDesc(clientId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getProviderOrders(Long providerId) {
        return orderRepository.findByProvider_IdOrderByCreatedAtDesc(providerId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO updateStatus(Long orderId, Long userId, String status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isProvider = order.getProvider().getId().equals(userId);
        boolean isClient = order.getClient().getId().equals(userId);

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());

        if (newStatus == Order.OrderStatus.ACCEPTED || newStatus == Order.OrderStatus.REJECTED
                || newStatus == Order.OrderStatus.COMPLETED) {
            if (!isProvider) throw new RuntimeException("Only the provider can update this status");
        }

        order.setStatus(newStatus);
        return toDTO(orderRepository.save(order));
    }

    private OrderResponseDTO toDTO(Order o) {
        return OrderResponseDTO.builder()
            .id(o.getId())
            .serviceId(o.getService().getId())
            .serviceTitle(o.getService().getTitle())
            .servicePrice(o.getService().getPrice())
            .clientId(o.getClient().getId())
            .clientName(o.getClient().getFirstName() + " " + o.getClient().getLastName())
            .clientPhoto(o.getClient().getProfilePhoto())
            .providerId(o.getProvider().getId())
            .providerName(o.getProvider().getFirstName() + " " + o.getProvider().getLastName())
            .status(o.getStatus().name())
            .note(o.getNote())
            .createdAt(o.getCreatedAt())
            .updatedAt(o.getUpdatedAt())
            .build();
    }
}