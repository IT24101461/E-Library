package com.elibrary.backend.controller;

import com.elibrary.backend.dto.*;
import com.elibrary.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping
    public ReviewResponse create(@Valid @RequestBody ReviewCreateRequest req) {
        return service.create(req);
    }

    @GetMapping
    public Page<ReviewResponse> list(
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(required = false) Integer ratingMin,
            @RequestParam(required = false) Integer ratingMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return service.list(bookId, sort, ratingMin, ratingMax, page, size);
    }

    @GetMapping("/summary")
    public Object summary(@RequestParam Long bookId) {
        return service.summary(bookId);
    }

    @PutMapping("/{id}")
    public ReviewResponse update(
            @PathVariable Long id,
            @RequestParam Long userId,
            @Valid @RequestBody ReviewUpdateRequest req
    ) {
        return service.update(id, userId, req);
    }

    @DeleteMapping("/{id}")
    public void softDelete(
            @PathVariable Long id,
            @RequestParam(defaultValue = "ADMIN") String deletedBy,
            @RequestParam(defaultValue = "Moderation") String reason
    ) {
        service.softDelete(id, deletedBy, reason);
    }
}