package com.elibrary.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // ── GET all personal books (bookshelf view — your 60 books) ──
    public List<Book> getAllBooks() {
        return bookRepository.findByIsPersonal(true);
    }

    // ── GET books by list name (only personal books) ──
    public List<Book> getBooksByList(String listName) {
        return bookRepository.findByListNameAndIsPersonal(listName, true);
    }

    // ── SEARCH across all 4800+ books ──
    public List<Book> searchBooks(String query) {
        return bookRepository.searchAllBooks(query);
    }

    // ── ADD book to a list ──
    public Book addBook(Book book) {
        if (bookRepository.existsByTitleAndListName(book.getTitle(), book.getListName())) {
            throw new RuntimeException("\"" + book.getTitle() + "\" is already in " + book.getListName());
        }
        book.setIsPersonal(true); // always personal when manually added
        return bookRepository.save(book);
    }

    // ── ADD discovered book to personal library ──
    public Book addToMyLibrary(Long id, String listName) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setIsPersonal(true);
        book.setListName(listName != null ? listName : "wantToRead");
        book.setStatus("wantToRead");
        book.setProgress(0);
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
        List<Book> books = bookRepository.findByListNameAndIsPersonal(listName, true);
        bookRepository.deleteAll(books);
    }
}