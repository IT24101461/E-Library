package com.elibrary.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.elibrary.backend.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
}