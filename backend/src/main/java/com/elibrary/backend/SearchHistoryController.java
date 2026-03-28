package com.elibrary.backend;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search-history")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SearchHistoryController {

    @Autowired
    private SearchHistoryService searchHistoryService;

    @GetMapping("/recent")
    public ResponseEntity<List<SearchHistory>> getRecentSearches(HttpServletRequest request) {
        List<SearchHistory> searches = searchHistoryService.getRecentSearches(request);
        return ResponseEntity.ok(searches);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSearchItem(
            @PathVariable Long id,
            HttpServletRequest request) {
        searchHistoryService.deleteSearchHistoryItem(request, id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Search history item deleted");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllSearchHistory(HttpServletRequest request) {
        searchHistoryService.clearAllSearchHistory(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All search history cleared");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Object[]>> getPopularSearches() {
        return ResponseEntity.ok(searchHistoryService.getPopularSearches());
    }

    // ── Update a search history item's query ─────────────────
    @PutMapping("/{id}")
    public ResponseEntity<SearchHistory> updateSearchItem(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String newQuery = body.get("searchQuery");
        SearchHistory updated = searchHistoryService.updateSearchQuery(request, id, newQuery);
        return ResponseEntity.ok(updated);
    }
}