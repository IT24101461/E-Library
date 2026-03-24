package com.elibrary.backend.repository;

import com.elibrary.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByBookIdAndUserIdAndDeletedFalse(Long bookId, Long userId);

    Page<Review> findByBookIdAndDeletedFalse(Long bookId, Pageable pageable);

    @Query(value = "SELECT * FROM reviews WHERE book_id = :bookId AND deleted = false " +
           "AND rating >= :min AND rating <= :max",
           countQuery = "SELECT COUNT(*) FROM reviews WHERE book_id = :bookId AND deleted = false " +
           "AND rating >= :min AND rating <= :max",
           nativeQuery = true)
    Page<Review> findByBookIdAndDeletedFalseWithRating(
            @Param("bookId") Long bookId,
            @Param("min") int ratingMin,
            @Param("max") int ratingMax,
            Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.bookId = :bookId AND r.deleted = false")
    Double avgRating(@Param("bookId") Long bookId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.bookId = :bookId AND r.deleted = false")
    long countActive(@Param("bookId") Long bookId);
}