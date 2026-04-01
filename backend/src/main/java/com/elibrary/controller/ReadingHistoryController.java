package com.elibrary.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.elibrary.model.ReadingHistory;
import com.elibrary.repository.ReadingHistoryRepository;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reading-history")
@CrossOrigin
public class ReadingHistoryController {

    @Autowired
    private ReadingHistoryRepository repository;

    @PostMapping("/start")
    public ReadingHistory startReading(
            @RequestParam Long userId,
            @RequestParam Long bookId) {
        ReadingHistory history = repository.findByUserIdAndBookId(userId, bookId);
        if (history == null) {
            history = new ReadingHistory();
            history.setUserId(userId);
            history.setBookId(bookId);
            history.setStartedAt(LocalDateTime.now());
        }
        history.setLastAccessedAt(LocalDateTime.now());
        return repository.save(history);
    }

    @PutMapping("/progress")
    public ReadingHistory updateProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam Integer lastPage,
            @RequestParam Integer bookmarkPage) {
        ReadingHistory history = repository.findByUserIdAndBookId(userId, bookId);
        history.setLastPage(lastPage);
        history.setBookmarkPage(bookmarkPage);
        history.setLastAccessedAt(LocalDateTime.now());
        return repository.save(history);
    }

    @GetMapping
    public List<ReadingHistory> getUserHistory(@RequestParam Long userId) {
        return repository.findByUserId(userId);
    }

    @DeleteMapping("/clear")
    public void clearHistory(@RequestParam Long userId) {
        List<ReadingHistory> list = repository.findByUserId(userId);
        repository.deleteAll(list);
    }
}