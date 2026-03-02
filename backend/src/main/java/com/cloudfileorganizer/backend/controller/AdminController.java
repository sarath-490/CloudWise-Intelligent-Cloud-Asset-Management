package com.cloudfileorganizer.backend.controller;

import com.cloudfileorganizer.backend.model.User;
import com.cloudfileorganizer.backend.repository.FileRepository;
import com.cloudfileorganizer.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats(@AuthenticationPrincipal User adminUser) {
        if (!"ADMIN".equals(adminUser.getRole())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized access");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            List<User> users = userRepository.findAll();
            Long totalSizeBytes = fileRepository.getTotalStorageSize();
            if (totalSizeBytes == null) totalSizeBytes = 0L;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", users.size());
            stats.put("activeUsers", users.size()); // Assuming all are active for now
            stats.put("totalStorage", formatSize(totalSizeBytes));
            stats.put("systemUptime", "99.99%"); // Mocked SLA
            stats.put("storageLimit", "100 GB"); // Configured limit

            List<Map<String, Object>> userList = new ArrayList<>();
            for (User u : users) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("name", u.getName());
                map.put("email", u.getEmail());
                
                Long userStorageBytes = fileRepository.getTotalStorageSizeByUser(u);
                if (userStorageBytes == null) userStorageBytes = 0L;
                
                map.put("storage", formatSize(userStorageBytes));
                map.put("joined", "2024"); // Would ideally be a createdAt field
                map.put("status", "Active");
                userList.add(map);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("stats", stats);
            response.put("users", userList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve admin stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private String formatSize(long bytes) {
        if (bytes == 0) return "0 B";
        double k = 1024.0;
        String[] sizes = {"B", "KB", "MB", "GB", "TB"};
        int i = (int) Math.floor(Math.log(bytes) / Math.log(k));
        return String.format("%.2f %s", bytes / Math.pow(k, i), sizes[i]);
    }
}
