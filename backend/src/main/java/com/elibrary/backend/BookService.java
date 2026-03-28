package com.elibrary.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    //Newly Added
    @Autowired
    private SearchHistoryService searchHistoryService;

    @Autowired
    private HttpServletRequest request;

    // ── GET all books in a list ──────────────────────────────
    public List<Book> getBooksByList(String listName) {
        return bookRepository.findByListName(listName);
    }

    // ── GET all books ────────────────────────────────────────
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // ── ADD book ────────────────────────────────────────────
    public Book addBook(Book book) {
        if (bookRepository.existsByTitleAndListName(book.getTitle(), book.getListName())) {
            throw new RuntimeException("\"" + book.getTitle() + "\" is already in " + book.getListName());
        }
        return bookRepository.save(book);
    }

    // ── REMOVE a book ───────────────────────────────────────
    public void removeBook(Long id) {
        bookRepository.deleteById(id);
    }

    // ── MOVE book to another list ────────────────────────────
    public Book moveBook(Long id, String targetList) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setListName(targetList);
        return bookRepository.save(book);
    }

    // ── CLEAR all books from a list ──────────────────────────
    public void clearList(String listName) {
        List<Book> books = bookRepository.findByListName(listName);
        bookRepository.deleteAll(books);
    }

    // Replace your advancedSearch method with this:
    public List<Book> advancedSearch(
            String q,
            String author,
            Integer yearMin,
            Integer yearMax,
            List<String> genres,
            String sort) {

        // YEAR VALIDATION - Add this!
        if (yearMin != null && yearMax != null && yearMin > yearMax) {
            throw new IllegalArgumentException("Minimum year cannot be greater than maximum year");
        }

        // normalise sort value; default → title
        if (sort == null || sort.isBlank()) sort = "title";

        // Perform the search
        List<Book> results = bookRepository.advancedSearch(
                (q      != null && !q.isBlank())      ? q.trim()      : null,
                (author != null && !author.isBlank())  ? author.trim() : null,
                yearMin,
                yearMax,
                (genres != null && !genres.isEmpty())  ? genres        : null,
                sort
        );

        // Record the search in history
        String searchType = (q != null && !q.isBlank()) ? "GENERAL" : "AUTHOR";
        searchHistoryService.recordSearch(
                q, author, yearMin, yearMax, genres, sort,
                results.size(), searchType, request
        );

        return results;
    }
}
