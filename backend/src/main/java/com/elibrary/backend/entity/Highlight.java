package com.elibrary.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "highlights")
public class Highlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookId;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Column(columnDefinition = "TEXT")
    private String note;

    private String savedAt;

    public Highlight() {}

    public Long getId() { return id; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getSavedAt() { return savedAt; }
    public void setSavedAt(String savedAt) { this.savedAt = savedAt; }
}