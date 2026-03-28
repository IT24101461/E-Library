package com.elibrary.service;

import com.elibrary.model.Book;
import com.elibrary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // READ - Get all books
    public List<Book> getAllBooks() {
        return bookRepository.findByIsDeletedFalse();
    }

    // READ - Get single book
    public Book getBook(Long id) {
        return bookRepository.findByIdAndIsDeletedFalse(id);
    }

    // READ - Get books by category
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategoryAndIsDeletedFalse(category);
    }

    // CREATE - Add a new book
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    // UPDATE - Update book info
    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book != null && !book.getIsDeleted()) {
            if (bookDetails.getTitle() != null) book.setTitle(bookDetails.getTitle());
            if (bookDetails.getAuthor() != null) book.setAuthor(bookDetails.getAuthor());
            if (bookDetails.getDescription() != null) book.setDescription(bookDetails.getDescription());
            if (bookDetails.getTotalPages() != null) book.setTotalPages(bookDetails.getTotalPages());
            if (bookDetails.getCategory() != null) book.setCategory(bookDetails.getCategory());
            return bookRepository.save(book);
        }
        return null;
    }

    // DELETE - Soft delete a book
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book != null) {
            book.setIsDeleted(true);
            bookRepository.save(book);
        }
    }

    // Bookshelf methods
    public List<Book> getBooksByList(String listName) {
        return bookRepository.findByListNameAndIsPersonal(listName, true);
    }

    public List<Book> searchBooks(String query) {
        return bookRepository.searchAllBooks(query);
    }

    public Book addBook(Book book) {
        if (bookRepository.existsByTitleAndListName(book.getTitle(), book.getListName())) {
            throw new RuntimeException("\"" + book.getTitle() + "\" is already in " + book.getListName());
        }
        book.setIsPersonal(true);
        return bookRepository.save(book);
    }

    public Book addToMyLibrary(Long id, String listName) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setIsPersonal(true);
        book.setListName(listName != null ? listName : "wantToRead");
        book.setStatus("wantToRead");
        book.setProgress(0);
        return bookRepository.save(book);
    }

    public void removeBook(Long id) {
        bookRepository.deleteById(id);
    }

    public Book moveBook(Long id, String targetList) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setListName(targetList);
        return bookRepository.save(book);
    }

    public void clearList(String listName) {
        List<Book> books = bookRepository.findByListNameAndIsPersonal(listName, true);
        bookRepository.deleteAll(books);
    }
}