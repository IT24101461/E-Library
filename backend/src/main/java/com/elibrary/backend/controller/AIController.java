package com.elibrary.backend.controller;

import com.elibrary.backend.entity.Book;
import com.elibrary.backend.service.AIRecommendationService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    private final AIRecommendationService aiRecommendationService;

    public AIController(AIRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }

    @GetMapping("/search")
    public List<Book> searchByVibe(@RequestParam String query) {
        return aiRecommendationService.searchByVibe(query);
    }
}