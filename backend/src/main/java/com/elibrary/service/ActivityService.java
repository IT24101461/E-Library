package com.elibrary.service;

import com.elibrary.model.ActivityLog;
import com.elibrary.model.Book;
import com.elibrary.model.User;
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.BookRepository;
import com.elibrary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE - Log a new activity
    public ActivityLog createActivity(Long userId, Long bookId, String action) {
        if ("BORROW".equalsIgnoreCase(action)) {
            // Prevent borrowing the same book twice
            if (activityLogRepository.existsByUserIdAndBookIdAndAction(userId, bookId, "BORROW")) {
                throw new IllegalArgumentException("You have already borrowed this book.");
            }

            // Check limits before saving
            Optional<User> userOpt = userRepository.findById(userId);
            boolean isPremium = userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsPremium());
            
            int dailyLimit = isPremium ? 10 : 2;
            
            // Start of today (midnight)
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
            
            long borrowedToday = activityLogRepository.countByUserIdAndActionAndTimestampAfter(
                userId, "BORROW", startOfToday
            );
            
            if (borrowedToday >= dailyLimit) {
                String msg = isPremium 
                    ? "Premium Scholars can borrow up to 10 books per day. You've reached your limit!"
                    : "Standard users can only borrow 2 books per day. Upgrade to Premium Scholar for 10 books/day!";
                throw new IllegalArgumentException(msg);
            }
        }

        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setBookId(bookId);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    // CREATE with more details
    public ActivityLog createActivity(Long userId, Long bookId, String action, Integer currentPage, Integer timeSpentMinutes) {
        if ("BORROW".equalsIgnoreCase(action)) {
            // Prevent borrowing the same book twice
            if (activityLogRepository.existsByUserIdAndBookIdAndAction(userId, bookId, "BORROW")) {
                throw new IllegalArgumentException("You have already borrowed this book.");
            }

            // Check limits before saving
            Optional<User> userOpt = userRepository.findById(userId);
            boolean isPremium = userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsPremium());
            
            int dailyLimit = isPremium ? 10 : 2;
            
            // Start of today (midnight)
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
            
            long borrowedToday = activityLogRepository.countByUserIdAndActionAndTimestampAfter(
                userId, "BORROW", startOfToday
            );
            
            if (borrowedToday >= dailyLimit) {
                String msg = isPremium 
                    ? "Premium Scholars can borrow up to 10 books per day. You've reached your limit!"
                    : "Standard users can only borrow 2 books per day. Upgrade to Premium Scholar for 10 books/day!";
                throw new IllegalArgumentException(msg);
            }
        }

        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setBookId(bookId);
        log.setAction(action);
        log.setCurrentPage(currentPage);
        log.setTimeSpentMinutes(timeSpentMinutes);
        // Mark high interest if time spent > 5 minutes
        log.setHighInterest(timeSpentMinutes != null && timeSpentMinutes > 5);
        log.setTimestamp(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    // READ - Get user's activity history
    public List<ActivityLog> getUserHistory(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }

    // DELETE - Hard delete an activity (completely remove from database)
    public void deleteActivity(Long activityId) {
        activityLogRepository.deleteById(activityId);
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
