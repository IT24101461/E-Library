package com.elibrary.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookshelf")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BookController {

    @Autowired
    private BookService bookService;

    // ── GET all personal books (bookshelf — your 60) ──────────
    // GET /api/bookshelf/all
    @GetMapping("/all")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    // ── GET books by list name ─────────────────────────────────
    // GET /api/bookshelf/list/favourites
    @GetMapping("/list/{listName}")
    public List<Book> getByList(@PathVariable String listName) {
        return bookService.getBooksByList(listName);
    }

    // ── SEARCH all 4800+ books ────────────────────────────────
    // GET /api/bookshelf/search?q=harry potter
    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam String q) {
        return bookService.searchBooks(q);
    }

    // ── ADD book to personal library from search results ──────
    // POST /api/bookshelf/add-to-library/5?listName=wantToRead
    @PostMapping("/add-to-library/{id}")
    public ResponseEntity<?> addToMyLibrary(
            @PathVariable Long id,
            @RequestParam(defaultValue = "wantToRead") String listName) {
        try {
            Book book = bookService.addToMyLibrary(id, listName);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── ADD a brand new book manually ────────────────────────
    // POST /api/bookshelf/add
    @PostMapping("/add")
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        try {
            Book saved = bookService.addBook(book);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── REMOVE a book ─────────────────────────────────────────
    // DELETE /api/bookshelf/remove/5
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<String> removeBook(@PathVariable Long id) {
        bookService.removeBook(id);
        return ResponseEntity.ok("Book removed");
    }

    // ── MOVE book to another list ──────────────────────────────
    // PUT /api/bookshelf/move/5?targetList=reading
    @PutMapping("/move/{id}")
    public ResponseEntity<?> moveBook(@PathVariable Long id, @RequestParam String targetList) {
        try {
            Book moved = bookService.moveBook(id, targetList);
            return ResponseEntity.ok(moved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── CLEAR entire list ──────────────────────────────────────
    // DELETE /api/bookshelf/clear/favourites
    @DeleteMapping("/clear/{listName}")
    public ResponseEntity<String> clearList(@PathVariable String listName) {
        bookService.clearList(listName);
        return ResponseEntity.ok("List cleared");
    }
}