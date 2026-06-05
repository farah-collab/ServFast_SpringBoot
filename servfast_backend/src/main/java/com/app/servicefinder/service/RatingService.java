package com.app.servicefinder.service;

import com.app.servicefinder.dto.rating.*;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public RatingResponseDTO createOrUpdate(Long userId, RatingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        com.app.servicefinder.model.Service service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new RuntimeException("Service not found"));

        Rating rating = ratingRepository.findByUser_IdAndService_Id(userId, request.getServiceId())
            .orElse(Rating.builder().user(user).service(service).build());

        rating.setScore(request.getScore());
        rating.setComment(request.getComment());

        return toDTO(ratingRepository.save(rating));
    }

    @Transactional(readOnly = true)
    public List<RatingResponseDTO> getByService(Long serviceId) {
        return ratingRepository.findByService_IdOrderByCreatedAtDesc(serviceId)
            .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<RatingResponseDTO> getByUser(Long userId) {
        return ratingRepository.findByUser_IdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDTO).toList();
    }

    @Transactional
    public void delete(Long ratingId, Long userId) {
        Rating rating = ratingRepository.findById(ratingId)
            .orElseThrow(() -> new RuntimeException("Rating not found"));
        if (!rating.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this rating");
        }
        ratingRepository.delete(rating);
    }

    public Double getAverageScore(Long serviceId) {
        Double avg = ratingRepository.findAverageScoreByServiceId(serviceId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public Long getCount(Long serviceId) {
        return ratingRepository.countByService_Id(serviceId);
    }

    public List<RatingResponseDTO> getRecentWithComment(int limit) {
        return ratingRepository
            .findByCommentIsNotNullOrderByCreatedAtDesc(PageRequest.of(0, limit))
            .stream()
            .map(r -> RatingResponseDTO.builder()
                .id(r.getId())
                .serviceId(r.getService().getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFirstName() + " " + r.getUser().getLastName())
                .userPhoto(r.getUser().getProfilePhoto())
                .score(r.getScore())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
    }

    private RatingResponseDTO toDTO(Rating r) {
        return RatingResponseDTO.builder()
            .id(r.getId())
            .serviceId(r.getService().getId())
            .userId(r.getUser().getId())
            .userName(r.getUser().getFirstName() + " " + r.getUser().getLastName())
            .userPhoto(r.getUser().getProfilePhoto())
            .score(r.getScore())
            .comment(r.getComment())
            .createdAt(r.getCreatedAt())
            .updatedAt(r.getUpdatedAt())
            .build();
    }
}