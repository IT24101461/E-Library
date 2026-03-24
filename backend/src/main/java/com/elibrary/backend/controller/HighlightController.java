package com.elibrary.backend.controller;

import com.elibrary.backend.entity.Highlight;
import com.elibrary.backend.repository.HighlightRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/highlights")
@CrossOrigin(origins = "http://localhost:5173")
public class HighlightController {

    private final HighlightRepository highlightRepository;

    public HighlightController(HighlightRepository highlightRepository) {
        this.highlightRepository = highlightRepository;
    }

    @GetMapping
    public List<Highlight> getAllHighlights() {
        return highlightRepository.findAll();
    }

    @PostMapping
    public Highlight saveHighlight(@RequestBody Highlight highlight) {
        return highlightRepository.save(highlight);
    }

    @PutMapping("/{id}")
    public Highlight updateHighlight(@PathVariable Long id, @RequestBody Highlight updatedHighlight) {
        Highlight highlight = highlightRepository.findById(id).orElseThrow();
        highlight.setNote(updatedHighlight.getNote());
        highlight.setText(updatedHighlight.getText());
        highlight.setSavedAt(updatedHighlight.getSavedAt());
        highlight.setBookId(updatedHighlight.getBookId());
        return highlightRepository.save(highlight);
    }

    @DeleteMapping("/{id}")
    public void deleteHighlight(@PathVariable Long id) {
        highlightRepository.deleteById(id);
    }

    @DeleteMapping
    public void clearAllHighlights() {
        highlightRepository.deleteAll();
    }
}