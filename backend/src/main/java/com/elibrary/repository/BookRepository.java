package com.elibrary.repository;

import com.elibrary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByIsDeletedFalse();
    Book findByIdAndIsDeletedFalse(Long id);
    List<Book> findByCategoryAndIsDeletedFalse(String category);

    List<Book> findByListNameAndIsPersonal(String listName, Boolean isPersonal);
    List<Book> findByIsPersonal(Boolean isPersonal);
    boolean existsByTitleAndListName(String title, String listName);

    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.keywords) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Book> searchAllBooks(@Param("q") String query);
}