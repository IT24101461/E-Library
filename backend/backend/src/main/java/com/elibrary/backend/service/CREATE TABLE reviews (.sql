CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    book_id BIGINT NULL,
    user_id BIGINT NULL,

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at DATETIME NULL,
    deleted_by VARCHAR(50) NULL,
    delete_reason VARCHAR(255) NULL,

    spam_status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',

    CONSTRAINT fk_review_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,

    CONSTRAINT fk_review_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT unique_user_book UNIQUE (book_id, user_id)
);
