package com.elibrary.backend;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookshelf")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private SearchHistoryService searchHistoryService;

    @GetMapping("/all")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/list/{listName}")
    public List<Book> getByList(@PathVariable String listName) {
        return bookService.getBooksByList(listName);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        try {
            Book saved = bookService.addBook(book);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<String> removeBook(@PathVariable Long id) {
        bookService.removeBook(id);
        return ResponseEntity.ok("Book removed");
    }

    @PutMapping("/move/{id}")
    public ResponseEntity<?> moveBook(@PathVariable Long id, @RequestParam String targetList) {
        try {
            Book moved = bookService.moveBook(id, targetList);
            return ResponseEntity.ok(moved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/clear/{listName}")
    public ResponseEntity<String> clearList(@PathVariable String listName) {
        bookService.clearList(listName);
        return ResponseEntity.ok("List cleared");
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> genre,
            @RequestParam(required = false) String author,
            @RequestParam(required = false, defaultValue = "general") String searchType,
            @RequestParam(required = false) Integer yearMin,
            @RequestParam(required = false) Integer yearMax,
            @RequestParam(required = false, defaultValue = "title") String sort,
            HttpServletRequest request) {

        try {
            List<Book> results = bookService.advancedSearch(q, author, yearMin, yearMax, genre, sort);
            System.out.println("DEBUG searchType received: " + searchType);
            searchHistoryService.recordSearch(
                    q, author, yearMin, yearMax, genre, sort,
                    results.size(), searchType, request
            );
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}