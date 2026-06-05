package com.app.servicefinder.repository;

import com.app.servicefinder.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByUserId(Long userId);
    List<Service> findByCategoryId(Long categoryId);
    List<Service> findByCityIgnoreCase(String city);
    List<Service> findByIsAvailableTrue();

    @Query("SELECT s FROM Service s WHERE " +
           "(:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:city IS NULL OR LOWER(s.city) = LOWER(:city)) " +
           "AND (:categoryId IS NULL OR s.category.id = :categoryId) " +
           "AND (:maxPrice IS NULL OR s.price <= :maxPrice) " +
           "AND s.isAvailable = true")
    List<Service> searchServices(
        @Param("keyword") String keyword,
        @Param("city") String city,
        @Param("categoryId") Long categoryId,
        @Param("maxPrice") Double maxPrice
    );

    // Paginated search
    @Query("SELECT s FROM Service s WHERE " +
           "(:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:city IS NULL OR LOWER(s.city) = LOWER(:city)) " +
           "AND (:categoryId IS NULL OR s.category.id = :categoryId) " +
           "AND (:maxPrice IS NULL OR s.price <= :maxPrice) " +
           "AND s.isAvailable = true")
    Page<Service> searchServicesPaged(
        @Param("keyword") String keyword,
        @Param("city") String city,
        @Param("categoryId") Long categoryId,
        @Param("maxPrice") Double maxPrice,
        Pageable pageable
    );

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.service.id = :serviceId")
    Double getAverageRating(@Param("serviceId") Long serviceId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.service.id = :serviceId AND r.score <= 2")
    Long countBadRatings(@Param("serviceId") Long serviceId);

    // Count available services
    long countByIsAvailableTrue();

    // Featured services (most viewed, available)
    @Query("SELECT s FROM Service s WHERE s.isAvailable = true ORDER BY s.viewsCount DESC")
    List<Service> findFeaturedServices(Pageable pageable);
}