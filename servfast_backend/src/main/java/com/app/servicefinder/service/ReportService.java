package com.app.servicefinder.service;
 
import com.app.servicefinder.dto.report.ReportRequest;
import com.app.servicefinder.model.*;
import com.app.servicefinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class ReportService {
 
    private final ReportRepository reportRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
 
    public void submit(Long reporterId, ReportRequest request) {
        if (reportRepository.existsByReporterIdAndServiceId(reporterId, request.getServiceId())) {
            throw new IllegalArgumentException("Vous avez déjà signalé ce service");
        }
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        com.app.servicefinder.model.Service service = serviceRepository
                .findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        reportRepository.save(Report.builder()
                .reason(request.getReason())
                .reporter(reporter)
                .service(service)
                .status("PENDING")
                .build());
    }
 
    public List<Report> getPendingReports() {
        return reportRepository.findByStatus("PENDING");
    }
 
    public void resolve(Long reportId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("RESOLVED");
        reportRepository.save(report);
    }
}