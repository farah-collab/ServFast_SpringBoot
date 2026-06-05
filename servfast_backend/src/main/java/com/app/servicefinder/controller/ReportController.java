package com.app.servicefinder.controller;
 
import com.app.servicefinder.dto.report.ReportRequest;
import com.app.servicefinder.model.Report;
import com.app.servicefinder.security.JwtUtil;
import com.app.servicefinder.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
 
    private final ReportService reportService;
    private final JwtUtil jwtUtil;
 
    // POST /api/reports
    @PostMapping
    public ResponseEntity<Void> submit(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ReportRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        reportService.submit(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
 
    // GET /api/reports/pending  (admin)
    @GetMapping("/pending")
    public ResponseEntity<List<Report>> getPending() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }
 
    // PUT /api/reports/{id}/resolve  (admin)
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(@PathVariable Long id) {
        reportService.resolve(id);
        return ResponseEntity.ok().build();
    }
}