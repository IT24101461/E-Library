package com.elibrary.controller;

import com.elibrary.model.ReadingProgress;
import com.elibrary.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ProgressController {
    private static final Logger logger = LoggerFactory.getLogger(ProgressController.class);

    @Autowired
    private ProgressService progressService;

    // PUT - Update reading progress
    @PutMapping
    public ResponseEntity<ReadingProgress> updateProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam Integer currentPage,
            @RequestParam(required = false) Integer totalPages
    ) {
        logger.info("PUT /progress - userId={}, bookId={}, currentPage={}, totalPages={}", userId, bookId, currentPage, totalPages);
        try {
            ReadingProgress progress = progressService.updateProgress(userId, bookId, currentPage, totalPages != null ? totalPages : 300);
            logger.info("Successfully updated progress");
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            logger.error("Error updating progress - userId={}, bookId={}", userId, bookId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // GET - Retrieve reading progress
    @GetMapping
    public ResponseEntity<ReadingProgress> getProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId
    ) {
        logger.info("GET /progress - userId={}, bookId={}", userId, bookId);
        try {
            ReadingProgress progress = progressService.getProgress(userId, bookId);
            if (progress != null) {
                logger.info("Found progress: currentPage={}, totalPages={}", progress.getCurrentPage(), progress.getTotalPages());
                return ResponseEntity.ok(progress);
            } else {
                logger.warn("No progress found for userId={}, bookId={}", userId, bookId);
                return ResponseEntity.ok(new ReadingProgress(userId, bookId));
            }
        } catch (Exception e) {
            logger.error("Error retrieving progress - userId={}, bookId={}", userId, bookId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
