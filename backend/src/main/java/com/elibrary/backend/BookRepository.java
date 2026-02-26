package com.elibrary.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Get all books in a specific list (e.g. "favourites", "reading", "wishlist")
    List<Book> findByListName(String listName);

    // Check if a book title already exists in a list
    boolean existsByTitleAndListName(String title, String listName);
}