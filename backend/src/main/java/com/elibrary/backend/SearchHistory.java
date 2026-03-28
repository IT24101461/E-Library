package com.elibrary.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "search_type")
    private String searchType = "GENERAL";

    @Column(name = "search_query", nullable = false)
    private String searchQuery;

    @Column(name = "filters_applied", columnDefinition = "JSON")
    private String filtersApplied;

    @Column(name = "results_count")
    private Integer resultsCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public SearchHistory() {}

    public SearchHistory(String sessionId, String searchType, String searchQuery,
                         String filtersApplied, Integer resultsCount) {
        this.sessionId = sessionId;
        this.searchType = searchType;
        this.searchQuery = searchQuery;
        this.filtersApplied = filtersApplied;
        this.resultsCount = resultsCount;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getSearchType() { return searchType; }
    public void setSearchType(String searchType) { this.searchType = searchType; }

    public String getSearchQuery() { return searchQuery; }
    public void setSearchQuery(String searchQuery) { this.searchQuery = searchQuery; }

    public String getFiltersApplied() { return filtersApplied; }
    public void setFiltersApplied(String filtersApplied) { this.filtersApplied = filtersApplied; }

    public Integer getResultsCount() { return resultsCount; }
    public void setResultsCount(Integer resultsCount) { this.resultsCount = resultsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}