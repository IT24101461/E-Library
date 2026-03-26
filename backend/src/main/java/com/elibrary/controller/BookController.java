package com.elibrary.controller;

import com.elibrary.model.Book;
import com.elibrary.service.BookService;
import com.elibrary.repository.UserRepository;
import com.elibrary.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", 
                         "http://localhost:5173", "http://localhost:5174"})
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private UserRepository userRepository;

    // ─────────────────────────────────────────
    // TEAMMATE'S ENDPOINTS — /books/...
    // ─────────────────────────────────────────

    @GetMapping("/books")
    public ResponseEntity<List<Book>> getAllBooks() {
        try {
            List<Book> books = bookService.getAllBooks();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book != null) return ResponseEntity.ok(book);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/books/{id}/content")
    public ResponseEntity<String> getBookContent(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book != null && book.getContent() != null) return ResponseEntity.ok(book.getContent());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/books/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        try {
            List<Book> books = bookService.getBooksByCategory(category);
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/books")
    public ResponseEntity<?> createBook(@RequestParam(required = false) Long userId, @RequestBody Book book) {
        try {
            if (userId == null)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Missing userId"));
            var optUser = userRepository.findByIdAndIsDeletedFalse(userId);
            if (optUser.isEmpty() || !"ADMIN".equalsIgnoreCase(optUser.get().getRole()))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can add books"));
            Book created = bookService.createBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create book"));
        }
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        try {
            Book updated = bookService.updateBook(id, bookDetails);
            if (updated != null) return ResponseEntity.ok(updated);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.ok("{\"message\": \"Book deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Failed to delete book\"}");
        }
    }

    // ─────────────────────────────────────────
    // YOUR ENDPOINTS — /api/bookshelf/...
    // ─────────────────────────────────────────

    @GetMapping("/api/bookshelf/all")
    public List<Book> getAllBookshelfBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/api/bookshelf/list/{listName}")
    public List<Book> getByList(@PathVariable String listName) {
        return bookService.getBooksByList(listName);
    }

    @GetMapping("/api/bookshelf/search")
    public List<Book> searchBooks(@RequestParam String q) {
        return bookService.searchBooks(q);
    }

    @PostMapping("/api/bookshelf/add-to-library/{id}")
    public ResponseEntity<?> addToMyLibrary(@PathVariable Long id,
            @RequestParam(defaultValue = "wantToRead") String listName) {
        try {
            Book book = bookService.addToMyLibrary(id, listName);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/api/bookshelf/add")
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        try {
            Book saved = bookService.addBook(book);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/api/bookshelf/remove/{id}")
    public ResponseEntity<String> removeBook(@PathVariable Long id) {
        bookService.removeBook(id);
        return ResponseEntity.ok("Book removed");
    }

    @PutMapping("/api/bookshelf/move/{id}")
    public ResponseEntity<?> moveBook(@PathVariable Long id, @RequestParam String targetList) {
        try {
            Book moved = bookService.moveBook(id, targetList);
            return ResponseEntity.ok(moved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/api/bookshelf/clear/{listName}")
    public ResponseEntity<String> clearList(@PathVariable String listName) {
        bookService.clearList(listName);
        return ResponseEntity.ok("List cleared");
    }
}