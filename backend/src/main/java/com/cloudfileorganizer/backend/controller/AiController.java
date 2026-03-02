package com.cloudfileorganizer.backend.controller;

import com.cloudfileorganizer.backend.model.User;
import com.cloudfileorganizer.backend.repository.UserRepository;
import com.cloudfileorganizer.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        
        // Get user from SecurityContext (the JWT filter sets the User entity as the principal)
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        String response = aiService.chatWithAgent(query, user);
        
        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/analyze/{fileId}")
    public ResponseEntity<Map<String, String>> analyze(@PathVariable String fileId) {
        aiService.analyzeFile(fileId);
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "Analysis triggered for file ID: " + fileId);
        return ResponseEntity.ok(result);
    }
}
