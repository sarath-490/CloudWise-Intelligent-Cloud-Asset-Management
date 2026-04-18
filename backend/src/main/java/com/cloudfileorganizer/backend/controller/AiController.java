package com.cloudfileorganizer.backend.controller;

import com.cloudfileorganizer.backend.model.User;
import com.cloudfileorganizer.backend.repository.UserRepository;
import com.cloudfileorganizer.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    public static class ChatRequest {
        private String query;
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, Authentication auth) {
        User user = (User) auth.getPrincipal();
        String response = aiService.chatWithAgent(request.getQuery(), user);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/analyze/{fileId}")
    public ResponseEntity<Map<String, Object>> analyze(@PathVariable String fileId) {
        try {
            aiService.analyzeFile(fileId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Analysis complete for file ID: " + fileId);
            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Analysis failed: " + e.getMessage());
            result.put("success", false);
            return ResponseEntity.status(500).body(result);
        }
    }
}
