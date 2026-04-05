package com.elibrary.repository;

import com.elibrary.model.ReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {
    Optional<ReadingProgress> findByUserIdAndBookIdAndIsDeletedFalse(Long userId, Long bookId);
<<<<<<< HEAD
    List<ReadingProgress> findByUserId(Long userId);
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
}
