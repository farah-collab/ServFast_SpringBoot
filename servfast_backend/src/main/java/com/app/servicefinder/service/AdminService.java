package com.app.servicefinder.service;

import com.app.servicefinder.model.Service;
import com.app.servicefinder.model.User;
import com.app.servicefinder.repository.ServiceRepository;
import com.app.servicefinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public void deleteUser(Long adminId, Long targetUserId) {
        verifyAdmin(adminId);
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        // Additional cleanup might be needed (e.g. deleting associated ratings, orders, services) depending on cascade settings.
        // For now, we will simply delete the user.
        userRepository.delete(target);
    }

    @Transactional
    public void deleteService(Long adminId, Long serviceId) {
        verifyAdmin(adminId);
        Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        serviceRepository.delete(service);
    }

    private void verifyAdmin(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (user.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("User does not have ADMIN privileges");
        }
    }
}
