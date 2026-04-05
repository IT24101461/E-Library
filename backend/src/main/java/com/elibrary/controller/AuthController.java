package com.elibrary.controller;

import com.elibrary.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.elibrary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
<<<<<<< HEAD
    private static final String ADMIN_ACCESS_CODE = "ADMIN123"; // Admin code for creating admin accounts
=======
<<<<<<< HEAD
    private static final String ADMIN_ACCESS_CODE = "ADMIN123"; // Admin code for creating admin accounts
=======
<<<<<<< HEAD
    private static final String ADMIN_ACCESS_CODE = "ADMIN123"; // Admin code for creating admin accounts
=======
<<<<<<< HEAD
    private static final String ADMIN_ACCESS_CODE = "ADMIN123"; // Admin code for creating admin accounts
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String fullName = body.get("fullName");
            String password = body.get("password");

            if (email == null || password == null || fullName == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing fields"));
            }

            if (userRepository.findByEmailAndIsDeletedFalse(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists"));
            }

            User user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(passwordEncoder.encode(password));

            // Determine role: prefer client-provided role (if valid), otherwise
            // make the first registered user an ADMIN for initial setup.
            String requestedRole = body.get("role");
            if (requestedRole != null) {
                requestedRole = requestedRole.trim();
                if (requestedRole.isEmpty()) requestedRole = null;
            }
            long userCount = userRepository.count();
            if (requestedRole != null) {
                if ("ADMIN".equalsIgnoreCase(requestedRole)) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
                    // Verify admin code for ADMIN registration
                    String adminCode = body.get("adminCode");
                    if (adminCode == null || !adminCode.trim().equals(ADMIN_ACCESS_CODE)) {
                        logger.warn("Admin code validation failed. Provided: {}, Expected: {}", adminCode, ADMIN_ACCESS_CODE);
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid admin code"));
                    }
                    logger.info("Admin code validated successfully for email: {}", email);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
                    user.setRole("ADMIN");
                } else {
                    user.setRole("USER");
                }
            } else {
                if (userCount == 0) {
                    user.setRole("ADMIN");
                } else {
                    user.setRole("USER");
                }
            }

            logger.info("Register request: email={}, requestedRole={}, assignedRole={}", email, requestedRole, user.getRole());

            User saved = userRepository.save(user);
            // Do not return password
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", saved.getId());
            resp.put("email", saved.getEmail());
            resp.put("fullName", saved.getFullName());
            resp.put("role", saved.getRole());

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to register"));
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");

            if (email == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing fields"));
            }

            var opt = userRepository.findByEmailAndIsDeletedFalse(email);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }

            User user = opt.get();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", user.getId());
            resp.put("email", user.getEmail());
            resp.put("fullName", user.getFullName());
            resp.put("role", user.getRole());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Login failed"));
        }
    }

    // Logout is handled client-side by removing stored user info
}
