package com.elibrary.repository;

import com.elibrary.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    Optional<User> findByIdAndIsDeletedFalse(Long id);
<<<<<<< HEAD
    List<User> findByIsDeletedFalse();
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
}
