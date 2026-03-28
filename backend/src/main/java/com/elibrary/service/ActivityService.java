package com.elibrary.service;

import com.elibrary.model.ActivityLog;
import com.elibrary.model.Book;
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private BookRepository bookRepository;

    // CREATE - Log a new activity
    public ActivityLog createActivity(Long userId, Long bookId, String action) {
        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setBookId(bookId);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    // CREATE with more details
    public ActivityLog createActivity(Long userId, Long bookId, String action, Integer currentPage, Integer timeSpentMinutes) {
        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setBookId(bookId);
        log.setAction(action);
        log.setCurrentPage(currentPage);
        log.setTimeSpentMinutes(timeSpentMinutes);
        log.setHighInterest(timeSpentMinutes != null && timeSpentMinutes > 5);
        log.setTimestamp(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    // READ - Get user's activity history
    public List<ActivityLog> getUserHistory(Long userId) {
        return activityLogRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    // DELETE - Soft delete an activity (for privacy)
    public void deleteActivity(Long activityId) {
        ActivityLog log = activityLogRepository.findById(activityId).orElse(null);
        if (log != null) {
            log.setIsDeleted(true);
            activityLogRepository.save(log);
        }
    }

    // Get stats for dashboard
    public ActivityStatsDTO getUserStats(Long userId) {
        List<ActivityLog> activities = getUserHistory(userId);

        // Calculate reading velocity (pages per hour) using explicit SESSION logs
        List<ActivityLog> sessionActivities = activities.stream()
                .filter(a -> "SESSION".equals(a.getAction()))
                .collect(java.util.stream.Collectors.toList());

        int totalPages = sessionActivities.stream()
                .mapToInt(a -> a.getCurrentPage() != null ? a.getCurrentPage() : 0)
                .sum();
        int totalMinutes = sessionActivities.stream()
                .mapToInt(a -> a.getTimeSpentMinutes() != null ? a.getTimeSpentMinutes() : 0)
                .sum();
        double readingVelocity = totalMinutes > 0 ? (totalPages / (double) totalMinutes) * 60 : 0;

        // Count unique books
        long booksRead = activities.stream()
                .map(ActivityLog::getBookId)
                .distinct()
                .count();

        // Calculate streak (simplified - assumes daily activities)
        long currentStreak = activities.stream()
                .filter(a -> a.getHighInterest())
                .count();

        return new ActivityStatsDTO(
                (int) readingVelocity,
                (int) currentStreak,
                (int) booksRead
        );
    }

    // DTO for stats
    public static class ActivityStatsDTO {
        public int readingVelocity;
        public int currentStreak;
        public int booksRead;

        public ActivityStatsDTO(int readingVelocity, int currentStreak, int booksRead) {
            this.readingVelocity = readingVelocity;
            this.currentStreak = currentStreak;
            this.booksRead = booksRead;
        }

        public int getReadingVelocity() { return readingVelocity; }
        public int getCurrentStreak() { return currentStreak; }
        public int getBooksRead() { return booksRead; }
    }
}