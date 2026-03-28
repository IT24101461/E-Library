package com.elibrary.controller;

import com.elibrary.model.ActivityLog;
import com.elibrary.model.Book;
import com.elibrary.service.ActivityService;
import com.elibrary.service.ProgressService;
import com.elibrary.repository.BookRepository;
import com.elibrary.model.ReadingProgress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private BookRepository bookRepository;

    // GET - Retrieve user's activity history with real book details
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@RequestParam Long userId) {
        try {
            List<ActivityLog> activities = activityService.getUserHistory(userId);

            List<Map<String, Object>> response = activities.stream()
                    .map(activity -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", activity.getId());
                        map.put("bookId", activity.getBookId());

                        Book book = bookRepository.findById(activity.getBookId()).orElse(null);
                        if (book != null) {
                            map.put("title", book.getTitle());
                            map.put("author", book.getAuthor());
                            map.put("totalPages", book.getTotalPages());
                            map.put("coverUrl", book.getCoverUrl());
                            map.put("category", book.getCategory());
                            map.put("description", book.getDescription());
                        } else {
                            map.put("title", "Unknown Book");
                            map.put("author", "Unknown Author");
                            map.put("totalPages", 300);
                            map.put("coverUrl", null);
                            map.put("category", "Unknown");
                            map.put("description", "");
                        }

                        ReadingProgress progress = progressService.getProgress(activity.getUserId(), activity.getBookId());
                        if (progress != null) {
                            map.put("currentPage", progress.getCurrentPage() != null ? progress.getCurrentPage() : 0);
                        } else {
                            map.put("currentPage", activity.getCurrentPage() != null ? activity.getCurrentPage() : 0);
                        }
                        map.put("lastRead", activity.getTimestamp());
                        map.put("action", activity.getAction());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Reading stats for a user
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam Long userId) {
        try {
            ActivityService.ActivityStatsDTO statsDTO = activityService.getUserStats(userId);

            Map<String, Object> stats = new HashMap<>();
            stats.put("booksRead", statsDTO.getBooksRead());
            stats.put("readingVelocity", statsDTO.getReadingVelocity());
            stats.put("currentStreak", statsDTO.getCurrentStreak());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            // Return safe defaults so the dashboard still loads
            Map<String, Object> defaults = new HashMap<>();
            defaults.put("booksRead", 0);
            defaults.put("readingVelocity", 0);
            defaults.put("currentStreak", 0);
            return ResponseEntity.ok(defaults);
        }
    }

    // GET - Reading progress for a specific book
    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId) {
        try {
            ReadingProgress progress = progressService.getProgress(userId, bookId);
            Map<String, Object> response = new HashMap<>();
            if (progress != null) {
                response.put("currentPage", progress.getCurrentPage() != null ? progress.getCurrentPage() : 0);
                response.put("totalPages", progress.getTotalPages() != null ? progress.getTotalPages() : 0);
                response.put("userId", userId);
                response.put("bookId", bookId);
            } else {
                response.put("currentPage", 0);
                response.put("totalPages", 0);
                response.put("userId", userId);
                response.put("bookId", bookId);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("currentPage", 0);
            response.put("totalPages", 0);
            return ResponseEntity.ok(response);
        }
    }

    // PUT - Update reading progress
    @PutMapping("/progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam Integer currentPage,
            @RequestParam(required = false, defaultValue = "0") Integer totalPages) {
        try {
            progressService.updateProgress(userId, bookId, currentPage, totalPages);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Progress updated successfully");
            response.put("currentPage", currentPage);
            response.put("totalPages", totalPages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update progress: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // POST - Create new activity
    @PostMapping("/activity")
    public ResponseEntity<Map<String, Object>> createActivity(@RequestBody Map<String, Object> request) {
        try {
            if (request.get("userId") == null || request.get("bookId") == null || request.get("action") == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Missing required fields: userId, bookId, action");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Long userId = ((Number) request.get("userId")).longValue();
            Long bookId = ((Number) request.get("bookId")).longValue();
            String action = (String) request.get("action");
            Integer currentPage = request.get("currentPage") != null ? ((Number) request.get("currentPage")).intValue() : null;
            Integer timeSpentMinutes = request.get("timeSpentMinutes") != null ? ((Number) request.get("timeSpentMinutes")).intValue() : null;

            ActivityLog activity = activityService.createActivity(userId, bookId, action, currentPage, timeSpentMinutes);

            Map<String, Object> response = new HashMap<>();
            response.put("id", activity.getId());
            response.put("bookId", activity.getBookId());
            response.put("userId", activity.getUserId());
            response.put("action", action);
            response.put("timestamp", activity.getTimestamp());
            response.put("message", "Activity created successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create activity: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // DELETE - Remove activity from history
    @DeleteMapping("/history/{activityId}")
    public ResponseEntity<String> deleteActivity(@PathVariable Long activityId) {
        try {
            activityService.deleteActivity(activityId);
            return ResponseEntity.ok("{\"message\": \"Activity deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to delete activity\"}");
        }
    }
}