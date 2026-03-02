package com.cloudfileorganizer.backend.controller;

import com.cloudfileorganizer.backend.model.FileMetadata;
import com.cloudfileorganizer.backend.model.User;
import com.cloudfileorganizer.backend.service.FileService;
import com.cloudfileorganizer.backend.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private S3Service s3Service;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            User user = getCurrentUser();
            
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "File is empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            FileMetadata fileMetadata = fileService.uploadFile(file, user, category);

            Map<String, Object> response = new HashMap<>();
            response.put("id", fileMetadata.getId());
            response.put("name", fileMetadata.getName());
            response.put("size", fileMetadata.getSize());
            response.put("category", fileMetadata.getCategory());
            response.put("uploadDate", fileMetadata.getUploadDate());
            response.put("mimeType", fileMetadata.getMimeType());
            response.put("aiCategory", fileMetadata.getAiCategory());
            response.put("aiSummary", fileMetadata.getAiSummary());
            response.put("aiTags", fileMetadata.getAiTags());
            response.put("aiConfidence", fileMetadata.getAiConfidence());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getFiles(
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            User user = getCurrentUser();
            List<FileMetadata> files;
            
            if (category != null && !category.isEmpty()) {
                files = fileService.getFilesByCategory(user, category);
            } else {
                files = fileService.getFilesByUser(user);
            }

            List<Map<String, Object>> fileList = files.stream().map(file -> {
                Map<String, Object> fileMap = new HashMap<>();
                fileMap.put("id", file.getId());
                fileMap.put("name", file.getName());
                fileMap.put("originalName", file.getOriginalName());
                fileMap.put("size", file.getSize());
                fileMap.put("category", file.getCategory());
                fileMap.put("uploadDate", file.getUploadDate());
                fileMap.put("mimeType", file.getMimeType());
                fileMap.put("aiCategory", file.getAiCategory());
                fileMap.put("aiSummary", file.getAiSummary());
                fileMap.put("aiTags", file.getAiTags());
                fileMap.put("aiConfidence", file.getAiConfidence());
                return fileMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(fileList);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve files: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFile(@PathVariable String id) {
        try {
            User user = getCurrentUser();
            FileMetadata fileMetadata = fileService.getFileById(id, user)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            Map<String, Object> fileMap = new HashMap<>();
            fileMap.put("id", fileMetadata.getId());
            fileMap.put("name", fileMetadata.getName());
            fileMap.put("originalName", fileMetadata.getOriginalName());
            fileMap.put("size", fileMetadata.getSize());
            fileMap.put("category", fileMetadata.getCategory());
            fileMap.put("uploadDate", fileMetadata.getUploadDate());
            fileMap.put("mimeType", fileMetadata.getMimeType());
            fileMap.put("aiCategory", fileMetadata.getAiCategory());
            fileMap.put("aiSummary", fileMetadata.getAiSummary());
            fileMap.put("aiTags", fileMetadata.getAiTags());
            fileMap.put("aiConfidence", fileMetadata.getAiConfidence());

            return ResponseEntity.ok(fileMap);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String id) {
        try {
            User user = getCurrentUser();
            FileMetadata fileMetadata = fileService.getFileById(id, user)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // Stream the file through the backend — never expose S3 URLs to the client
            InputStreamResource resource = new InputStreamResource(
                    s3Service.getFileStream(fileMetadata.getS3Key())
            );

            String contentType = fileMetadata.getMimeType() != null 
                    ? fileMetadata.getMimeType() 
                    : "application/octet-stream";
            
            String fileName = fileMetadata.getOriginalName() != null 
                    ? fileMetadata.getOriginalName() 
                    : fileMetadata.getName();

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileMetadata.getSize()))
                    .body(resource);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to download file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
        try {
            User user = getCurrentUser();
            fileService.deleteFile(id, user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Delete failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
