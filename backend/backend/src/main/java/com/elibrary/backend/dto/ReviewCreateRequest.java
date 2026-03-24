package com.elibrary.backend.dto;

import jakarta.validation.constraints.*;

public record ReviewCreateRequest(
        @NotNull Long bookId,
        @NotNull Long userId,
        @Min(1) @Max(5) int rating,
        @NotBlank @Size(min=20, max=2000) String comment
) {}