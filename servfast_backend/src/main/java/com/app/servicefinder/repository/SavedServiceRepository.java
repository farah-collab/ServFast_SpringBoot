package com.app.servicefinder.repository;
 
import com.app.servicefinder.model.SavedService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface SavedServiceRepository extends JpaRepository<SavedService, Long> {
    List<SavedService> findByUserId(Long userId);
    Optional<SavedService> findByUserIdAndServiceId(Long userId, Long serviceId);
    boolean existsByUserIdAndServiceId(Long userId, Long serviceId);
    void deleteByUserIdAndServiceId(Long userId, Long serviceId);
}