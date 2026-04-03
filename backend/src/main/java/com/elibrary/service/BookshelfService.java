package com.elibrary.service;

import com.elibrary.model.BookshelfItem;
import com.elibrary.repository.BookshelfRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookshelfService {

    @Autowired
    private BookshelfRepository bookshelfRepository;

    public List<BookshelfItem> getUserBookshelf(Long userId) {
        return bookshelfRepository.findByUserId(userId);
    }

    public BookshelfItem addToBookshelf(Long userId, BookshelfItem item) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        
        item.setUserId(userId);
        
        // Set defaults if not provided
        if (item.getRating() == null) {
            item.setRating(0.0);
        }
        if (item.getProgress() == null) {
            item.setProgress(0);
        }
        if (item.getStatus() == null || item.getStatus().isEmpty()) {
            item.setStatus("new");
        }
        if (item.getListName() == null || item.getListName().isEmpty()) {
            item.setListName("favourites");
        }
        
        return bookshelfRepository.save(item);
    }

    @Transactional
    public void removeFromBookshelf(Long id) {
        bookshelfRepository.deleteById(id);
    }

    @Transactional
    public void clearList(Long userId, String listName) {
        bookshelfRepository.deleteByUserIdAndListName(userId, listName);
    }

    @Transactional
    public BookshelfItem moveToList(Long id, String targetList) throws Exception {
        Optional<BookshelfItem> existing = bookshelfRepository.findById(id);
        if (existing.isPresent()) {
            BookshelfItem item = existing.get();
            item.setListName(targetList);
            return bookshelfRepository.save(item);
        } else {
            throw new Exception("Bookshelf item not found");
        }
    }
}
