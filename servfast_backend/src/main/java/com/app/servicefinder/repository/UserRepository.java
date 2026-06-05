package com.app.servicefinder.repository;

import com.app.servicefinder.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // All providers (role = PROVIDER)
    List<User> findByRole(User.Role role);

    // Paginated providers
    Page<User> findByRole(User.Role role, Pageable pageable);

    // Search experts by name or specialty
    @Query("""
        SELECT u FROM User u
        WHERE u.role = 'PROVIDER'
          AND (:keyword IS NULL
               OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.specialty) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<User> searchExperts(@Param("keyword") String keyword, Pageable pageable);

    // Featured experts: verified providers ordered by experience (top N via Pageable)
    @Query("""
        SELECT u FROM User u
        WHERE u.role = 'PROVIDER' AND u.verified = true
        ORDER BY u.experienceYears DESC
        """)
    List<User> findFeaturedExperts(Pageable pageable);
}