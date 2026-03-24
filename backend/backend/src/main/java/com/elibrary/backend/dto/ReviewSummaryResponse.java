package com.elibrary.backend.dto;

public record ReviewSummaryResponse(
        Long bookId,
        double averageRating,
        long totalReviews
) {}