package com.elibrary.backend;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchHistoryService {

    private static final Logger log = LoggerFactory.getLogger(SearchHistoryService.class);

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public void recordSearch(
            String query,
            String author,
            Integer yearMin,
            Integer yearMax,
            List<String> genres,
            String sort,
            int resultsCount,
            String searchType,
            HttpServletRequest request) {

        try {
            String sessionId = request.getSession().getId();

            // Don't record empty searches (silent — expected on page load)
            if ((query == null || query.trim().isEmpty()) &&
                    (author == null || author.trim().isEmpty())) {
                return;
            }

            String effectiveQuery = (query != null && !query.trim().isEmpty())
                    ? query.trim()
                    : author.trim();

            // Deduplicate — skip if same query was saved in the last 60 seconds
            LocalDateTime dedupeWindow = LocalDateTime.now().minusSeconds(60);
            boolean isDuplicate = searchHistoryRepository
                    .findRecentBySessionId(sessionId, dedupeWindow)
                    .stream()
                    .anyMatch(h -> h.getSearchQuery().equalsIgnoreCase(effectiveQuery));

            if (isDuplicate) {
                log.info("[SearchHistory] Skipped duplicate | query='{}'", effectiveQuery);
                return;
            }

            // Build filters JSON
            Map<String, Object> filters = new HashMap<>();
            filters.put("author", author);
            filters.put("yearMin", yearMin);
            filters.put("yearMax", yearMax);
            filters.put("genres", genres);
            filters.put("sort", sort);
            String filtersJson = objectMapper.writeValueAsString(filters);

            // Save
            SearchHistory history = new SearchHistory(
                    sessionId, searchType, effectiveQuery, filtersJson, resultsCount
            );
            searchHistoryRepository.save(history);

            // Clean log — replace null with "-" for readability
            log.info("[SearchHistory] Saved | session={} | query='{}' | author='{}' | genres={} | yearMin={} | yearMax={} | sort={} | results={}",
                    sessionId,
                    effectiveQuery,
                    author  != null ? author  : "-",
                    genres  != null ? genres  : "-",
                    yearMin != null ? yearMin : "-",
                    yearMax != null ? yearMax : "-",
                    sort,
                    resultsCount);

            // Clean up records older than 30 days
            searchHistoryRepository.deleteOlderThan(LocalDateTime.now().minusDays(30));

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public List<SearchHistory> getRecentSearches(HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<SearchHistory> results = searchHistoryRepository.findRecentBySessionId(sessionId, cutoff);

        log.info("[SearchHistory] Fetched recent searches | session={} | count={}", sessionId, results.size());
        results.forEach(h -> log.info("  -> id={} | query='{}' | type={} | results={} | at={}",
                h.getId(), h.getSearchQuery(), h.getSearchType(), h.getResultsCount(), h.getCreatedAt()));

        return results;
    }

    public void deleteSearchHistoryItem(HttpServletRequest request, Long id) {
        String sessionId = request.getSession().getId();
        searchHistoryRepository.deleteBySessionIdAndId(sessionId, id);
        log.info("[SearchHistory] Deleted item | session={} | id={}", sessionId, id);
    }

    public void clearAllSearchHistory(HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        searchHistoryRepository.deleteAllBySessionId(sessionId);
        log.info("[SearchHistory] Cleared all history | session={}", sessionId);
    }

    public List<Object[]> getPopularSearches() {
        return searchHistoryRepository.getPopularSearches();
    }

    // ── Update a search history item's query ─────────────────
    public SearchHistory updateSearchQuery(HttpServletRequest request, Long id, String newQuery) {
        String sessionId = request.getSession().getId();
        SearchHistory item = searchHistoryRepository.findById(id)
            .filter(h -> h.getSessionId().equals(sessionId))
            .orElseThrow(() -> new RuntimeException("Item not found or unauthorized"));
        item.setSearchQuery(newQuery);
        log.info("[SearchHistory] Updated item | session={} | id={} | newQuery='{}'", sessionId, id, newQuery);
        return searchHistoryRepository.save(item);
    }
}