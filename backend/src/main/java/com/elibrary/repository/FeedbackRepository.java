package com.elibrary.repository;

import com.elibrary.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByStatus(String status);
    List<Feedback> findByType(String type);
    List<Feedback> findAllByOrderByCreatedAtDesc();
<<<<<<< HEAD
    List<Feedback> findByUserId(Long userId);
    List<Feedback> findByUserIdAndIsDeletedFalse(Long userId);
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
}
