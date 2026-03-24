package com.elibrary.backend.controller;

import com.elibrary.backend.entity.Book;
import com.elibrary.backend.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:5173")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    // uploads folder will be created in your backend project root
    private final Path uploadPath = Paths.get("uploads");

    // ✅ Upload a book (PDF)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Book> uploadBook(
            @RequestParam String title,
            @RequestParam String author,
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file) {

        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Create uploads folder if not exists
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetFile = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            // Save DB record
            Book book = new Book();
            book.setTitle(title);
            book.setAuthor(author);
            book.setDescription(description);
            book.setFileUrl(fileName);
            book.setTotalDownloads(0);

            Book saved = bookRepository.save(book);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ List all books
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookRepository.findAll());
    }

    // ✅ Get single book details
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Increase download count
    @PostMapping("/{id}/download-count")
    public ResponseEntity<Book> increaseDownloadCount(@PathVariable Long id) {
        return bookRepository.findById(id).map(book -> {
            book.setTotalDownloads(book.getTotalDownloads() + 1);
            return ResponseEntity.ok(bookRepository.save(book));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ View/Read PDF in browser (React can use this URL in iframe/react-pdf)
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> viewBookFile(@PathVariable Long id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.notFound().build();

        Path filePath = uploadPath.resolve(book.getFileUrl());
        if (!Files.exists(filePath)) return ResponseEntity.notFound().build();

        Resource resource = new FileSystemResource(filePath.toFile());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + book.getFileUrl() + "\"")
                .body(resource);
    }

    // ✅ Force download file (optional)
    @GetMapping("/{id}/download-file")
    public ResponseEntity<Resource> downloadBookFile(@PathVariable Long id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.notFound().build();

        Path filePath = uploadPath.resolve(book.getFileUrl());
        if (!Files.exists(filePath)) return ResponseEntity.notFound().build();

        Resource resource = new FileSystemResource(filePath.toFile());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + book.getFileUrl() + "\"")
                .body(resource);
    }

    // ✅ Edit a book (metadata and optionally a new PDF file)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Book> updateBook(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String author,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile file) {

        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.notFound().build();

        try {
            // Update metadata
            book.setTitle(title);
            book.setAuthor(author);
            book.setDescription(description);

            // Update file if provided
            if (file != null && !file.isEmpty()) {
                // Create uploads folder if not exists
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Delete old file
                try {
                    Path oldFilePath = uploadPath.resolve(book.getFileUrl());
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException ignored) {}

                // Save new file
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path targetFile = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
                
                book.setFileUrl(fileName);
            }

            Book updated = bookRepository.save(book);
            return ResponseEntity.ok(updated);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Delete a book (and its file)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.notFound().build();

        // delete file if exists
        try {
            Path filePath = uploadPath.resolve(book.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}

        bookRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}