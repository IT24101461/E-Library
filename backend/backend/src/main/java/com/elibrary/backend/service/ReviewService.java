package com.elibrary.backend.service;

import com.elibrary.backend.dto.*;
import com.elibrary.backend.entity.Review;
import com.elibrary.backend.repository.ReviewRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class ReviewService {

    private final ReviewRepository repo;

    public ReviewService(ReviewRepository repo) {
        this.repo = repo;
    }

    public ReviewResponse create(ReviewCreateRequest req) {
        if (repo.existsByBookIdAndUserIdAndDeletedFalse(req.bookId(), req.userId())) {
            throw new RuntimeException("Duplicate review: user already reviewed this book.");
        }

        LocalDateTime now = LocalDateTime.now();

        Review r = Review.builder()
                .bookId(req.bookId())
                .userId(req.userId())
                .rating(req.rating())
                .comment(req.comment().trim())
                .createdAt(now)
                .updatedAt(now)
                .deleted(false)
                .build();

        Review saved = repo.save(r);
        return toDto(saved);
    }

    public Page<ReviewResponse> list(Long bookId, String sort, Integer ratingMin, Integer ratingMax, int page, int size) {
        Sort s = switch (sort) {
            case "highest" -> Sort.by(Sort.Direction.DESC, "rating")
                    .and(Sort.by(Sort.Direction.DESC, "createdAt"));
            case "lowest" -> Sort.by(Sort.Direction.ASC, "rating")
                    .and(Sort.by(Sort.Direction.DESC, "createdAt"));
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Page<Review> data;
        if (ratingMin != null || ratingMax != null) {
            data = repo.findByBookIdAndDeletedFalseWithRating(
                    bookId,
                    ratingMin != null ? ratingMin : 1,
                    ratingMax != null ? ratingMax : 5,
                    PageRequest.of(page, size, s));
        } else {
            data = repo.findByBookIdAndDeletedFalse(bookId, PageRequest.of(page, size, s));
        }
        return data.map(this::toDto);
    }

    public ReviewSummaryResponse summary(Long bookId) {
        Double avgDb = repo.avgRating(bookId);
        double avg = avgDb == null ? 0.0 : avgDb;
        long total = repo.countActive(bookId);
        return new ReviewSummaryResponse(bookId, avg, total);
    }

    public ReviewResponse update(Long id, Long userId, ReviewUpdateRequest req) {
        Review r = repo.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
        if (r.isDeleted()) throw new RuntimeException("Review is deleted.");
        if (!r.getUserId().equals(userId)) throw new RuntimeException("Not your review.");

        long minutes = Duration.between(r.getCreatedAt(), LocalDateTime.now()).toMinutes();
        if (minutes > 60) throw new RuntimeException("Edit time expired (1 hour).");

        r.setRating(req.rating());
        r.setComment(req.comment().trim());
        r.setUpdatedAt(LocalDateTime.now());

        return toDto(repo.save(r));
    }

    public void softDelete(Long id, String deletedBy, String reason) {
        Review r = repo.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
        if (r.isDeleted()) return;

        r.setDeleted(true);
        r.setDeletedAt(LocalDateTime.now());
        r.setDeletedBy(deletedBy);
        r.setDeleteReason(reason);

        repo.save(r);
    }

    private ReviewResponse toDto(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getBookId(),
                r.getUserId(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}