package com.app.servicefinder.repository;
 
import com.app.servicefinder.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(String status);
    List<Report> findByServiceId(Long serviceId);
    boolean existsByReporterIdAndServiceId(Long reporterId, Long serviceId);
}