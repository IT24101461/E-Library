package com.elibrary.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Get all books in a specific list (only personal books)
    List<Book> findByListNameAndIsPersonal(String listName, Boolean isPersonal);

    // Get all personal books (the 60 shown in bookshelf)
    List<Book> findByIsPersonal(Boolean isPersonal);

    // Check if a book title already exists in a list
    boolean existsByTitleAndListName(String title, String listName);

    // Search across ALL 4800+ books (title, author, keywords)
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.keywords) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Book> searchAllBooks(@Param("q") String query);
}