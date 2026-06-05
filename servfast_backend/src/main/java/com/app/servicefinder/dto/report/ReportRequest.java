package com.app.servicefinder.dto.report;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank
    @Size(max = 2000)
    private String reason;

    @NotNull
    private Long serviceId;
}