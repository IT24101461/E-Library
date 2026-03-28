package com.elibrary.backend;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;
    private String genre;
    private String emoji;
    private double rating;
    private String status;
    private int progress;
    private String listName;

    // ── New fields for Advanced Search (Feature) ──────────────
    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "keywords", length = 1000)
    private String keywords;   // comma-separated keywords, e.g. "magic,adventure,fantasy"

    @Column(name = "cover_image", length = 500)
    private String coverImage; // URL to cover image (nullable → frontend shows placeholder)
}
