package com.elibrary.repository;

import com.elibrary.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
<<<<<<< HEAD
import java.util.List;
=======
<<<<<<< HEAD
import java.util.List;
=======
<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    Optional<User> findByIdAndIsDeletedFalse(Long id);
<<<<<<< HEAD
    List<User> findByIsDeletedFalse();
=======
<<<<<<< HEAD
    List<User> findByIsDeletedFalse();
=======
<<<<<<< HEAD
    List<User> findByIsDeletedFalse();
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
}
