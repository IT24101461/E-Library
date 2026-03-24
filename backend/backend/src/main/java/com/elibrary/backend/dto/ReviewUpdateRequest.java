package com.elibrary.backend.dto;

import jakarta.validation.constraints.*;

public record ReviewUpdateRequest(
        @Min(1) @Max(5) int rating,
        @NotBlank @Size(min=20, max=2000) String comment
) {}