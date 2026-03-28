package com.elibrary.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findBySessionIdOrderByCreatedAtDesc(String sessionId);

    @Query("SELECT sh FROM SearchHistory sh WHERE sh.sessionId = :sessionId " +
            "AND sh.createdAt > :cutoff ORDER BY sh.createdAt DESC")
    List<SearchHistory> findRecentBySessionId(@Param("sessionId") String sessionId,
                                              @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT sh FROM SearchHistory sh WHERE sh.sessionId = :sessionId " +
            "AND sh.searchType = :type ORDER BY sh.createdAt DESC")
    List<SearchHistory> findBySessionIdAndType(@Param("sessionId") String sessionId,
                                               @Param("type") String type);

    @Modifying
    @Transactional
    @Query("DELETE FROM SearchHistory sh WHERE sh.sessionId = :sessionId")
    void deleteAllBySessionId(@Param("sessionId") String sessionId);

    @Modifying
    @Transactional
    void deleteBySessionIdAndId(String sessionId, Long id);

    @Query("SELECT sh.searchQuery, COUNT(sh) as freq FROM SearchHistory sh " +
            "GROUP BY sh.searchQuery ORDER BY freq DESC")
    List<Object[]> getPopularSearches();

    @Modifying
    @Transactional
    @Query("DELETE FROM SearchHistory sh WHERE sh.createdAt < :cutoff")
    void deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);
}