package com.elibrary.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "total_pages")
    private Integer totalPages;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "pdf_url", columnDefinition = "LONGTEXT")
    private String pdfUrl;

    @Column(name = "isbn")
    private String isbn;

    private String category;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    // Bookshelf fields
    private String genre;
    private String emoji;
    private double rating;
    private String status;
    private int progress;

    @Column(name = "list_name")
    private String listName;

    @Column(name = "cover_image")
    private String coverImage;

    private String keywords;

    @Column(name = "is_personal")
    private Boolean isPersonal = false;

    // Lombok @Data generates getters/setters for most fields, but Boolean fields
    // starting with "is" need explicit accessors to match Spring/JPA conventions.
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Boolean getIsPersonal() { return isPersonal; }
    public void setIsPersonal(Boolean isPersonal) { this.isPersonal = isPersonal; }
}