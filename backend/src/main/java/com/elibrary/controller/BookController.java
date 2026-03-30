package com.elibrary.controller;

import com.elibrary.model.Book;
import com.elibrary.service.BookService;
import com.elibrary.repository.UserRepository;
import com.elibrary.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001",
                         "http://localhost:5173", "http://localhost:5174"})
public class BookController {

    private static final java.util.logging.Logger log = java.util.logging.Logger.getLogger(BookController.class.getName());

    @Autowired
    private BookService bookService;

    @Autowired
    private UserRepository userRepository;

    // PDF directory — resolved as absolute normalized path to avoid Windows /../ string issues
    private static final String PDF_DIR = Paths.get(System.getProperty("user.dir"))
            .resolve("../pdf")
            .normalize()
            .toAbsolutePath()
            .toString() + File.separator;

    // ─────────────────────────────────────────
    // BOOK ENDPOINTS — /api/books/...
    // ─────────────────────────────────────────

    // GET - Retrieve all books
    @GetMapping("/books")
    public ResponseEntity<List<Book>> getAllBooks() {
        try {
            List<Book> books = bookService.getAllBooks();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Retrieve single book
    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book != null) {
                return ResponseEntity.ok(book);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Serve PDF file for a book
    @GetMapping("/books/{id}/file")
    public ResponseEntity<Resource> getBookFile(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            // Try pdfUrl field first
            String pdfUrl = book.getPdfUrl();
            File pdfFile = null;

            log.info("[PDF] Resolved PDF_DIR = " + PDF_DIR);
            log.info("[PDF] Book id=" + id + " pdfUrl=" + pdfUrl);

            if (pdfUrl != null && !pdfUrl.isBlank()) {
                // If it's just a filename, look in pdf dir
                if (!pdfUrl.startsWith("http")) {
                    String filename = Paths.get(pdfUrl).getFileName().toString();
                    pdfFile = new File(PDF_DIR + filename);
                    log.info("[PDF] Trying primary path: " + pdfFile.getAbsolutePath() + " exists=" + pdfFile.exists());
                }
            }

            // Fallback: try to find by title in pdf dir
            if (pdfFile == null || !pdfFile.exists()) {
                File pdfDir = new File(PDF_DIR);
                if (pdfDir.exists()) {
                    String[] files = pdfDir.list((dir, name) -> name.endsWith(".pdf"));
                    if (files != null) {
                        String titleLower = book.getTitle() != null ? book.getTitle().toLowerCase() : "";
                        for (String f : files) {
                            if (titleLower.contains(f.replace(".pdf", "").toLowerCase())
                                    || f.toLowerCase().contains(titleLower.split("[^a-z0-9]")[0])) {
                                pdfFile = new File(PDF_DIR + f);
                                break;
                            }
                        }
                    }
                }
            }

            if (pdfFile == null || !pdfFile.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            Resource resource = new FileSystemResource(pdfFile);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdfFile.getName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Retrieve book content
    @GetMapping("/books/{id}/content")
    public ResponseEntity<String> getBookContent(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book != null && book.getContent() != null) {
                return ResponseEntity.ok(book.getContent());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Retrieve books by category
    @GetMapping("/books/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        try {
            List<Book> books = bookService.getBooksByCategory(category);
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // POST - Create new book (admin only)
    @PostMapping("/books")
    public ResponseEntity<?> createBook(@RequestParam(required = false) Long userId, @RequestBody Book book) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Missing userId"));
            }
            var optUser = userRepository.findByIdAndIsDeletedFalse(userId);
            if (optUser.isEmpty() || !"ADMIN".equalsIgnoreCase(optUser.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can add books"));
            }
            Book created = bookService.createBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create book"));
        }
    }

    // PUT - Update book
    @PutMapping("/books/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        try {
            Book updated = bookService.updateBook(id, bookDetails);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // DELETE - Delete book
    @DeleteMapping("/books/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.ok("{\"message\": \"Book deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to delete book\"}");
        }
    }

    // ─────────────────────────────────────────
    // BOOKSHELF ENDPOINTS — /api/bookshelf/...
    // ─────────────────────────────────────────

    @GetMapping("/bookshelf/all")
    public List<Book> getAllBookshelfBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/bookshelf/list/{listName}")
    public List<Book> getByList(@PathVariable String listName) {
        return bookService.getBooksByList(listName);
    }

    @GetMapping("/bookshelf/search")
    public List<Book> searchBooks(@RequestParam String q) {
        return bookService.searchBooks(q);
    }

    @PostMapping("/bookshelf/add-to-library/{id}")
    public ResponseEntity<?> addToMyLibrary(@PathVariable Long id,
            @RequestParam(defaultValue = "wantToRead") String listName) {
        try {
            Book book = bookService.addToMyLibrary(id, listName);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bookshelf/add")
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        try {
            Book saved = bookService.addBook(book);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/bookshelf/remove/{id}")
    public ResponseEntity<String> removeBook(@PathVariable Long id) {
        bookService.removeBook(id);
        return ResponseEntity.ok("Book removed");
    }

    @PutMapping("/bookshelf/move/{id}")
    public ResponseEntity<?> moveBook(@PathVariable Long id, @RequestParam String targetList) {
        try {
            Book moved = bookService.moveBook(id, targetList);
            return ResponseEntity.ok(moved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/bookshelf/clear/{listName}")
    public ResponseEntity<String> clearList(@PathVariable String listName) {
        bookService.clearList(listName);
        return ResponseEntity.ok("List cleared");
    }
}