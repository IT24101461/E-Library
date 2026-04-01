package com.elibrary.controller;
import com.elibrary.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Disabled - stats endpoint is handled by ActivityController GET /stats
// @RestController
@RequestMapping("/stats")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class StatsController {
    @Autowired
    private ActivityService activityService;

    @GetMapping
    public ResponseEntity<ActivityService.ActivityStatsDTO> getStats(@RequestParam Long userId) {
        try {
            ActivityService.ActivityStatsDTO stats = activityService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}