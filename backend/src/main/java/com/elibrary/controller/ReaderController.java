package com.elibrary.controller;

import com.elibrary.model.Bookmark;
import com.elibrary.model.Highlight;
import com.elibrary.repository.BookmarkRepository;
import com.elibrary.repository.HighlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reader")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReaderController {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private HighlightRepository highlightRepository;

    // --- Bookmarks ---

    @GetMapping("/bookmarks")
    public ResponseEntity<List<Bookmark>> getBookmarks(@RequestParam Long userId, @RequestParam(required = false) Long bookId) {
        try {
            List<Bookmark> bookmarks;
            if (bookId != null) {
                bookmarks = bookmarkRepository.findByUserIdAndBookId(userId, bookId);
            } else {
                bookmarks = bookmarkRepository.findByUserId(userId);
            }
            return ResponseEntity.ok(bookmarks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/bookmarks")
    public ResponseEntity<Bookmark> addBookmark(@RequestBody Bookmark bookmark) {
        try {
            Bookmark saved = bookmarkRepository.save(bookmark);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/bookmarks/{id}")
    public ResponseEntity<Void> deleteBookmark(@PathVariable Long id) {
        try {
            bookmarkRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Highlights ---

    @GetMapping("/highlights")
    public ResponseEntity<List<Highlight>> getHighlights(@RequestParam Long userId, @RequestParam(required = false) Long bookId) {
        try {
            List<Highlight> highlights;
            if (bookId != null) {
                highlights = highlightRepository.findByUserIdAndBookId(userId, bookId);
            } else {
                highlights = highlightRepository.findByUserId(userId);
            }
            return ResponseEntity.ok(highlights);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/highlights")
    public ResponseEntity<Highlight> addHighlight(@RequestBody Highlight highlight) {
        try {
            Highlight saved = highlightRepository.save(highlight);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/highlights/{id}")
    public ResponseEntity<Void> deleteHighlight(@PathVariable Long id) {
        try {
            highlightRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
