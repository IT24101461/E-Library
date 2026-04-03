package com.elibrary.controller;

import com.elibrary.model.SearchHistory;
import com.elibrary.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search-history")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @PostMapping
    public ResponseEntity<?> createSearchHistory(@RequestBody Map<String, Object> payload) {
        try {
            if (payload == null || !payload.containsKey("userId") || !payload.containsKey("searchQuery")) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId and searchQuery are required"));
            }

            Long userId = Long.valueOf(payload.get("userId").toString());
            String searchQuery = payload.get("searchQuery").toString().trim();
            
            if (searchQuery.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "searchQuery cannot be empty"));
            }
            
            SearchHistory history = new SearchHistory(userId, searchQuery);
            SearchHistory saved = searchHistoryRepository.save(history);
            return ResponseEntity.ok(saved);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid userId format"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save search history: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getSearchHistory(@PathVariable Long userId) {
        try {
            List<SearchHistory> history = searchHistoryRepository.findTop5ByUserIdOrderByTimestampDesc(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch search history: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    @Transactional
    public ResponseEntity<?> clearSearchHistory(@PathVariable Long userId) {
        try {
            searchHistoryRepository.deleteByUserId(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to clear search history: " + e.getMessage()));
        }
    }

    @DeleteMapping("/item/{id}")
    @Transactional
    public ResponseEntity<?> deleteSearchHistoryItem(@PathVariable Long id) {
        try {
            searchHistoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete search history: " + e.getMessage()));
        }
    }
}
