package com.elibrary.repository;

import com.elibrary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    List<Book> findByIsDeletedFalse();
    Book findByIdAndIsDeletedFalse(Long id);
    List<Book> findByCategoryAndIsDeletedFalse(String category);
}
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======

    // ── Teammate's queries ──
    List<Book> findByIsDeletedFalse();
    Book findByIdAndIsDeletedFalse(Long id);
    List<Book> findByCategoryAndIsDeletedFalse(String category);

    // ── Your queries ──
    List<Book> findByListNameAndIsPersonal(String listName, Boolean isPersonal);
    List<Book> findByIsPersonal(Boolean isPersonal);
    boolean existsByTitleAndListName(String title, String listName);

    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.keywords) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Book> searchAllBooks(@Param("q") String query);
}
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
