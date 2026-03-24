package com.elibrary.backend.service;

import com.elibrary.backend.entity.Book;
import com.elibrary.backend.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AIRecommendationService {

    private final BookRepository bookRepository;

    public AIRecommendationService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> searchByVibe(String query) {
        List<Book> allBooks = bookRepository.findAll();
        List<BookScore> scoredBooks = new ArrayList<>();

        String userQuery = query.toLowerCase().trim();

        for (Book book : allBooks) {
            int score = calculateScore(book, userQuery);

            if (score > 0) {
                scoredBooks.add(new BookScore(book, score));
            }
        }

        scoredBooks.sort(Comparator.comparingInt(BookScore::getScore).reversed());

        List<Book> results = new ArrayList<>();
        for (BookScore item : scoredBooks) {
            results.add(item.getBook());
        }

        return results;
    }

    private int calculateScore(Book book, String query) {
        int score = 0;

        String title = safe(book.getTitle());
        String author = safe(book.getAuthor());
        String description = safe(book.getDescription());
        String content = safe(book.getContent());

        // Basic matching
        if (title.contains(query)) score += 5;
        if (author.contains(query)) score += 3;
        if (description.contains(query)) score += 3;
        if (content.contains(query)) score += 2;

        // Vibe logic
        if (query.contains("happy") || query.contains("feel good")) {
            if (description.contains("joy") || description.contains("hope")) score += 3;
        }

        if (query.contains("sad") || query.contains("emotional")) {
            if (description.contains("loss") || description.contains("heart")) score += 3;
        }

        if (query.contains("mystery") || query.contains("thrill")) {
            if (description.contains("mystery") || content.contains("crime")) score += 4;
        }

        if (query.contains("adventure") || query.contains("fantasy")) {
            if (content.contains("magic") || content.contains("journey")) score += 4;
        }

        return score;
    }

    private String safe(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private static class BookScore {
        private final Book book;
        private final int score;

        public BookScore(Book book, int score) {
            this.book = book;
            this.score = score;
        }

        public Book getBook() {
            return book;
        }

        public int getScore() {
            return score;
        }
    }
}