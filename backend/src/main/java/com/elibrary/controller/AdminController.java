package com.elibrary.controller;

import com.elibrary.model.User;
import com.elibrary.repository.UserRepository;
<<<<<<< HEAD
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.BookmarkRepository;
import com.elibrary.repository.HighlightRepository;
import com.elibrary.repository.FeedbackRepository;
import com.elibrary.repository.ReadingProgressRepository;
import com.elibrary.repository.SearchHistoryRepository;
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
import com.elibrary.service.BookService;
import com.elibrary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.time.LocalDateTime;
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
<<<<<<< HEAD
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private HighlightRepository highlightRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ReadingProgressRepository readingProgressRepository;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
    private BookService bookService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // GET - list all users (admin only)
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestParam Long userId) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can view users"));
            }

            // Return non-deleted users (proper database query)
            List<User> users = userRepository.findByIsDeletedFalse();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch users"));
        }
    }

    // POST - create a new user (admin only)
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body, @RequestParam Long userId) {
        try {
            // Verify admin
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can create users"));
            }

            String fullName = body.get("fullName");
            String email = body.get("email");
            String role = body.getOrDefault("role", "USER").toUpperCase();

            // Validate inputs
            if (fullName == null || fullName.trim().isEmpty() || email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name and email are required"));
            }

            // Check if email already exists
            if (userRepository.findByEmailAndIsDeletedFalse(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists"));
            }

            // Create new user with temporary password
            User newUser = new User();
            newUser.setFullName(fullName);
            newUser.setEmail(email);
            newUser.setRole(role);
            newUser.setPassword(passwordEncoder.encode("TempPass123!")); // Temporary password
            newUser.setIsDeleted(false);

            userRepository.save(newUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    // PUT - change user role (admin only)
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestParam Long userId, @RequestParam String role) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can change roles"));
            }

            var targetOpt = userRepository.findById(id);
            if (targetOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User target = targetOpt.get();
            target.setRole(role == null ? "USER" : role.toUpperCase());
            userRepository.save(target);
            return ResponseEntity.ok(Map.of("message", "Role updated", "role", target.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to change role"));
        }
    }

    // DELETE - soft-delete a user (admin only)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestParam Long userId) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can delete users"));
            }

            var targetOpt = userRepository.findByIdAndIsDeletedFalse(id);
            if (targetOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found or already deleted"));
            }

<<<<<<< HEAD
            // Soft-delete all user-related data (no hard deletes to avoid foreign key issues)
            // Soft-delete bookmarks
            var bookmarks = bookmarkRepository.findByUserIdAndIsDeletedFalse(id);
            for (var bookmark : bookmarks) {
                bookmark.setIsDeleted(true);
                bookmarkRepository.save(bookmark);
            }

            // Soft-delete highlights
            var highlights = highlightRepository.findByUserIdAndIsDeletedFalse(id);
            for (var highlight : highlights) {
                highlight.setIsDeleted(true);
                highlightRepository.save(highlight);
            }

            // Soft-delete reading progress
            var readingProgress = readingProgressRepository.findByUserId(id);
            for (var progress : readingProgress) {
                progress.setIsDeleted(true);
                readingProgressRepository.save(progress);
            }

            // Soft-delete feedback
            var feedbacks = feedbackRepository.findByUserIdAndIsDeletedFalse(id);
            for (var feedback : feedbacks) {
                feedback.setIsDeleted(true);
                feedbackRepository.save(feedback);
            }

            // Soft-delete search history
            var searchHistories = searchHistoryRepository.findByUserIdAndIsDeletedFalse(id);
            for (var history : searchHistories) {
                history.setIsDeleted(true);
                searchHistoryRepository.save(history);
            }

            // Soft-delete all activity logs for this user
            var userLogs = activityLogRepository.findByUserIdAndIsDeletedFalse(id);
            for (var log : userLogs) {
                log.setIsDeleted(true);
                activityLogRepository.save(log);
            }

            // Finally soft-delete the user
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
            User target = targetOpt.get();
            target.setIsDeleted(true);
            userRepository.save(target);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // DELETE - delete a book (admin only)
    @DeleteMapping("/books/{id}")
    public ResponseEntity<?> deleteBookAdmin(@PathVariable Long id, @RequestParam Long userId) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can delete books"));
            }

            // Ensure book exists
            if (bookRepository.findById(id).isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Book not found"));
            }

            bookService.deleteBook(id);
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete book: " + e.getMessage()));
        }
    }

    // PUT - reset user password (admin only)
    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestParam Long userId, @RequestBody Map<String, String> body) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can reset passwords"));
            }

            var targetOpt = userRepository.findById(id);
            if (targetOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            String newPassword = body.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Password cannot be empty"));
            }

            User target = targetOpt.get();
            target.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(target);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            response.put("userId", String.valueOf(id));
            response.put("tempPassword", newPassword);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to reset password"));
        }
    }
<<<<<<< HEAD

    // ============ END OF ADMIN ENDPOINTS ============
}

=======
}
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
