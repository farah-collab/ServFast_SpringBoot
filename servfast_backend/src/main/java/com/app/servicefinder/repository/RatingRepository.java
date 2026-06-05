package com.app.servicefinder.repository;

import com.app.servicefinder.model.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByService_IdOrderByCreatedAtDesc(Long serviceId);
    List<Rating> findByUser_IdOrderByCreatedAtDesc(Long userId);
    Optional<Rating> findByUser_IdAndService_Id(Long userId, Long serviceId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.service.id = :serviceId")
    Double findAverageScoreByServiceId(@Param("serviceId") Long serviceId);

    Long countByService_Id(Long serviceId);
    Page<Rating> findByCommentIsNotNullOrderByCreatedAtDesc(Pageable pageable);
}