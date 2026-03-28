package com.elibrary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.elibrary.model.ReadingHistory;
import java.util.List;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    List<ReadingHistory> findByUserId(Long userId);

    ReadingHistory findByUserIdAndBookId(Long userId, Long bookId);
}
