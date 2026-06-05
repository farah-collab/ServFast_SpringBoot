package com.app.servicefinder.dto.rating;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RatingRequest {
    @NotNull
    private Long serviceId;

    @NotNull @Min(1) @Max(5)
    private Integer score;

    @Size(max = 1000)
    private String comment;
}