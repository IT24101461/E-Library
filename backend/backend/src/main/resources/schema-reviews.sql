-- Run this in MySQL Workbench (database: elibrary_db) if review create fails with 500.
-- This ensures the table matches the backend entity column names.

DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  book_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  rating INT NOT NULL,
  comment VARCHAR(2000) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  deleted BIT NOT NULL DEFAULT 0,
  deleted_at DATETIME(6) NULL,
  deleted_by VARCHAR(255) NULL,
  delete_reason VARCHAR(255) NULL
);
