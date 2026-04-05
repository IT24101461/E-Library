package com.elibrary.repository;

import com.elibrary.model.Highlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HighlightRepository extends JpaRepository<Highlight, Long> {
    List<Highlight> findByUserIdAndBookId(Long userId, Long bookId);
    List<Highlight> findByUserId(Long userId);
<<<<<<< HEAD
    List<Highlight> findByUserIdAndIsDeletedFalse(Long userId);
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
}
