package com.elibrary.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // ── GET all books in a list (favourites / reading / wishlist / custom) ──
    public List<Book> getBooksByList(String listName) {
        return bookRepository.findByListName(listName);
    }

    // ── GET all books ──
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // ── ADD book to a list (favourites, reading, wishlist, or custom list name) ──
    public Book addBook(Book book) {
        // Prevent duplicates in the same list
        if (bookRepository.existsByTitleAndListName(book.getTitle(), book.getListName())) {
            throw new RuntimeException("\"" + book.getTitle() + "\" is already in " + book.getListName());
        }
        return bookRepository.save(book);
    }

    // ── REMOVE a book ──
    public void removeBook(Long id) {
        bookRepository.deleteById(id);
    }

    // ── MOVE book to another list ──
    public Book moveBook(Long id, String targetList) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setListName(targetList);
        return bookRepository.save(book);
    }

    // ── CLEAR all books from a list ──
    public void clearList(String listName) {
        List<Book> books = bookRepository.findByListName(listName);
        bookRepository.deleteAll(books);
    }
}