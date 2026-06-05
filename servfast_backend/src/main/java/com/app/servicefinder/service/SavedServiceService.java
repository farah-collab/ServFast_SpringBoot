package com.app.servicefinder.service;
 
import com.app.servicefinder.dto.service.ServiceResponseDTO;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class SavedServiceService {
 
    private final SavedServiceRepository savedServiceRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final ServiceService serviceService;
 
    public void save(Long userId, Long serviceId) {
        if (savedServiceRepository.existsByUserIdAndServiceId(userId, serviceId)) {
            throw new IllegalArgumentException("Service déjà sauvegardé");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        com.app.servicefinder.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        savedServiceRepository.save(SavedService.builder().user(user).service(service).build());
    }
 
    @Transactional
    public void unsave(Long userId, Long serviceId) {
        savedServiceRepository.deleteByUserIdAndServiceId(userId, serviceId);
    }
 
    public List<ServiceResponseDTO> getSaved(Long userId) {
        return savedServiceRepository.findByUserId(userId)
                .stream()
                .map(ss -> serviceService.mapToDTO(ss.getService()))
                .toList();
    }
 
    public boolean isSaved(Long userId, Long serviceId) {
        return savedServiceRepository.existsByUserIdAndServiceId(userId, serviceId);
    }
}