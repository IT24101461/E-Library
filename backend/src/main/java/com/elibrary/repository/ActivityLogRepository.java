package com.elibrary.repository;

import com.elibrary.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdAndIsDeletedFalse(Long userId);
    List<ActivityLog> findByBookIdAndUserIdAndIsDeletedFalse(Long bookId, Long userId);
}
