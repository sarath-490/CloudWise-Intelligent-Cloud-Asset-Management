package com.cloudfileorganizer.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;

import com.cloudfileorganizer.backend.repository.UserRepository;
import com.cloudfileorganizer.backend.security.JwtUtil;
import com.cloudfileorganizer.backend.model.User;
import com.cloudfileorganizer.backend.service.AppSettingService;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")

public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AppSettingService appSettingService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Check if email already exists
            if (userRepo.findByEmail(user.getEmail()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Validate required fields
            if (user.getName() == null || user.getName().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Validate password strength
            String pwd = user.getPassword();
            if (pwd.length() < 8 || !pwd.matches(".*[A-Z].*") || !pwd.matches(".*[a-z].*") || !pwd.matches(".*[0-9].*") || !pwd.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Password must be at least 8 characters with uppercase, lowercase, number, and special character");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Encode password and set role
            user.setPassword(encoder.encode(user.getPassword()));
            user.setRole("USER");

            if (user.getStorageLimitBytes() == null) {
                Long defaultLimit = appSettingService.getLong(
                        AppSettingService.KEY_DEFAULT_USER_STORAGE_LIMIT_BYTES,
                        1L * 1024 * 1024 * 1024
                );
                user.setStorageLimitBytes(defaultLimit);
            }
            
            // Save user
            User savedUser = userRepo.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail());

            // Create response with token and user data
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("name", savedUser.getName());
            userData.put("email", savedUser.getEmail());
            userData.put("role", savedUser.getRole());
            userData.put("aiClassificationEnabled", savedUser.getAiClassificationEnabled());
            userData.put("emailNotificationsEnabled", savedUser.getEmailNotificationsEnabled());
            userData.put("active", savedUser.getActive());
            userData.put("storageLimitBytes", savedUser.getStorageLimitBytes());
            userData.put("createdAt", savedUser.getCreatedAt());
            
            response.put("user", userData);

            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {
        try {
            User user = userRepo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!encoder.matches(request.getPassword(), user.getPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid credentials");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            if (user.getActive() != null && !user.getActive()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Account is disabled. Contact support.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());

            // Create response with token and user data
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            userData.put("aiClassificationEnabled", user.getAiClassificationEnabled());
            userData.put("emailNotificationsEnabled", user.getEmailNotificationsEnabled());
            userData.put("active", user.getActive());
            userData.put("storageLimitBytes", user.getStorageLimitBytes());
            userData.put("createdAt", user.getCreatedAt());
            
            response.put("user", userData);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, Object> payload) {
        String email = payload.get("email") == null ? null : payload.get("email").toString();
        if (email == null || email.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        userRepo.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
            userRepo.save(user);
        });

        Map<String, String> response = new HashMap<>();
        response.put("message", "If the account exists, a reset link has been generated.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, Object> payload) {
        String token = payload.get("token") == null ? null : payload.get("token").toString();
        String password = payload.get("password") == null ? null : payload.get("password").toString();

        if (token == null || token.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Token is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (password == null || password.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Password is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String pwd = password;
        if (pwd.length() < 8 || !pwd.matches(".*[A-Z].*") || !pwd.matches(".*[a-z].*") || !pwd.matches(".*[0-9].*")
                || !pwd.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Password must be at least 8 characters with uppercase, lowercase, number, and special character");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        User user = userRepo.findByResetToken(token)
                .orElse(null);
        if (user == null || user.getResetTokenExpiresAt() == null
                || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Reset token is invalid or expired");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        user.setPassword(encoder.encode(password));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepo.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT is stateless, so logout is handled on client side
        // This endpoint is just for consistency
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
