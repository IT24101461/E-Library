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

    @Column(name = "list_name")
    private String listName;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "publication_year")
    private Integer publicationYear;

    private String keywords;
}