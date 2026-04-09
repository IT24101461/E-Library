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
    private static final String ADMIN_ACCESS_CODE = "ADMIN123"; // Admin code for creating admin accounts

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.elibrary.repository.AdminAccessRequestRepository adminAccessRequestRepository;

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

            java.util.Optional<User> existingUserOpt = userRepository.findByEmailAndIsDeletedFalse(email);
            String requestedRole = body.get("role");
            if (requestedRole != null) {
                requestedRole = requestedRole.trim();
                if (requestedRole.isEmpty()) requestedRole = null;
            }
            String adminCode = body.get("adminCode");

            if (existingUserOpt.isPresent()) {
                // Check if they are trying to upgrade to ADMIN with a valid code
                if ("ADMIN".equalsIgnoreCase(requestedRole) && adminCode != null && !adminCode.trim().isEmpty()) {
                    boolean validCode = false;
                    if (adminCode.trim().equals(ADMIN_ACCESS_CODE)) {
                        validCode = true;
                    } else if (adminAccessRequestRepository != null) {
                        var requestOpt = adminAccessRequestRepository.findByUserEmailAndAdminCode(email, adminCode);
                        if (requestOpt.isPresent() && !requestOpt.get().isCodeUsed()) {
                            validCode = true;
                            com.elibrary.model.AdminAccessRequest req = requestOpt.get();
                            req.setCodeUsed(true);
                            adminAccessRequestRepository.save(req);
                        }
                    }

                    if (validCode) {
                        User existingUser = existingUserOpt.get();
                        existingUser.setRole("ADMIN");
                        existingUser.setFullName(fullName);
                        existingUser.setPassword(passwordEncoder.encode(password));
                        userRepository.save(existingUser);

                        Map<String, Object> resp = new HashMap<>();
                        resp.put("id", existingUser.getId());
                        resp.put("email", existingUser.getEmail());
                        resp.put("fullName", existingUser.getFullName());
                        resp.put("role", existingUser.getRole());
                        resp.put("isPremium", existingUser.getIsPremium());
                        return ResponseEntity.ok(resp);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid or already used admin code"));
                    }
                }
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists"));
            }

            // Creating a new user
            User user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(passwordEncoder.encode(password));

            long userCount = userRepository.count();
            if (requestedRole != null) {
                if ("ADMIN".equalsIgnoreCase(requestedRole)) {
                    boolean validCode = false;
                    if (adminCode != null && adminCode.trim().equals(ADMIN_ACCESS_CODE)) {
                        validCode = true;
                    } else if (adminCode != null && adminAccessRequestRepository != null) {
                        var requestOpt = adminAccessRequestRepository.findByUserEmailAndAdminCode(email, adminCode);
                        if (requestOpt.isPresent() && !requestOpt.get().isCodeUsed()) {
                            validCode = true;
                            com.elibrary.model.AdminAccessRequest req = requestOpt.get();
                            req.setCodeUsed(true);
                            adminAccessRequestRepository.save(req);
                        }
                    }

                    if (!validCode) {
                        logger.warn("Admin code validation failed. Provided: {}", adminCode);
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid admin code"));
                    }
                    logger.info("Admin code validated successfully for email: {}", email);
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
            resp.put("isPremium", saved.getIsPremium());

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
            resp.put("isPremium", user.getIsPremium());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Login failed"));
        }
    }

    // Logout is handled client-side by removing stored user info

    // Upgrade to Premium
    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeToPremium(@RequestBody Map<String, Object> body) {
        try {
            if (!body.containsKey("userId") || body.get("userId") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing userId"));
            }
            Long userId = Long.valueOf(body.get("userId").toString());

            java.util.Optional<User> userOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setIsPremium(true);
            userRepository.save(user);

            logger.info("User {} upgraded to Premium Scholar", user.getEmail());

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", user.getId());
            resp.put("email", user.getEmail());
            resp.put("fullName", user.getFullName());
            resp.put("role", user.getRole());
            resp.put("isPremium", user.getIsPremium());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upgrade"));
        }
    }
}
