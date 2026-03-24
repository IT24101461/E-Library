package com.elibrary.backend.repository;

import com.elibrary.backend.entity.Highlight;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HighlightRepository extends JpaRepository<Highlight, Long> {
}