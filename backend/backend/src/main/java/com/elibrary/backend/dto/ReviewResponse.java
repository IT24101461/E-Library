package com.elibrary.backend.dto;

import java.time.LocalDateTime;
//import java.time.temporal.Temporal;

public record ReviewResponse(
        Long id,
        Long bookId,
        Long userId,
        int rating,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {} 