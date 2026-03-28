package com.elibrary.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // ── Existing queries ──────────────────────────────────────
    List<Book> findByListName(String listName);
    boolean existsByTitleAndListName(String title, String listName);

    // ── Advanced Search (native MySQL query) ──────────────────
    // All params optional — null values skip the filter.
    // :genres uses IN clause; pass null list to skip genre filter.
    // Sort is handled via FIELD() and CASE in native SQL.
    @Query(value = """
        SELECT * FROM books b
        WHERE
            (
                :q IS NULL
                OR LOWER(b.title)    LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.author)   LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(b.keywords) LIKE LOWER(CONCAT('%', :q, '%'))
            )
            AND (:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%')))
            AND (:yearMin IS NULL OR b.publication_year >= :yearMin)
            AND (:yearMax IS NULL OR b.publication_year <= :yearMax)
            AND (:#{#genres == null || #genres.isEmpty()} = true OR b.genre IN (:genres))
        ORDER BY
            CASE WHEN :sort = 'title'  THEN b.title  END ASC,
            CASE WHEN :sort = 'author' THEN b.author END ASC,
            CASE WHEN :sort = 'year'   THEN b.publication_year END DESC,
            b.id ASC
        """, nativeQuery = true)
    List<Book> advancedSearch(
        @Param("q")       String q,
        @Param("author")  String author,
        @Param("yearMin") Integer yearMin,
        @Param("yearMax") Integer yearMax,
        @Param("genres")  List<String> genres,
        @Param("sort")    String sort
    );
}
