package com.cloudfileorganizer.backend.service;

import com.cloudfileorganizer.backend.model.FileMetadata;
import com.cloudfileorganizer.backend.model.User;
import com.cloudfileorganizer.backend.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private AiService aiService;

    /**
     * Upload file to S3 and save metadata
     */
    public FileMetadata uploadFile(MultipartFile file, User user, String category) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > 100 * 1024 * 1024) { 
            throw new IllegalArgumentException("File size exceeds 100MB limit");
        }

        // Normalize or infer category
        String inferredCategory = category;
        if (inferredCategory == null || inferredCategory.trim().isEmpty()) {
            inferredCategory = inferCategoryFromType(file.getOriginalFilename(), file.getContentType());
        }
        String normalizedCategory = normalizeCategory(inferredCategory);

        // Upload to S3
        String s3Key = s3Service.uploadFile(file, normalizedCategory, user.getId());

        // Create file metadata
        FileMetadata fileMetadata = new FileMetadata();
        fileMetadata.setName(file.getOriginalFilename());
        fileMetadata.setOriginalName(file.getOriginalFilename());
        fileMetadata.setSize(file.getSize());
        fileMetadata.setMimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        fileMetadata.setS3Key(s3Key);
        fileMetadata.setBucketName(s3Service.getBucketName());
        fileMetadata.setCategory(normalizedCategory);
        fileMetadata.setUploadDate(LocalDateTime.now());
        fileMetadata.setUser(user);

        // Save metadata to database
        FileMetadata savedFile = fileRepository.save(fileMetadata);

        // Trigger AI analysis asynchronously
        new Thread(() -> aiService.analyzeFile(savedFile.getId())).start();

        return savedFile;
    }

    /**
     * Get all files for a user
     */
    public List<FileMetadata> getFilesByUser(User user) {
        return fileRepository.findByUser(user);
    }

    /**
     * Get file by ID (user-restricted)
     */
    public Optional<FileMetadata> getFileById(String id, User user) {
        return fileRepository.findByIdAndUser(id, user);
    }

    /**
     * Get files by category (user-restricted)
     */
    public List<FileMetadata> getFilesByCategory(User user, String category) {
        return fileRepository.findByUserAndCategory(user, category);
    }

    /**
     * Delete file from S3 and database
     */
    public void deleteFile(String id, User user) throws IOException {
        FileMetadata fileMetadata = fileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("File not found or access denied"));

        // Delete from S3
        try {
            s3Service.deleteFile(fileMetadata.getS3Key());
        } catch (Exception e) {
            throw new IOException("Failed to delete file from S3: " + e.getMessage(), e);
        }

        // Delete from database
        fileRepository.delete(fileMetadata);
    }

    /**
     * Generate download URL for file
     */
    public String generateDownloadUrl(String id, User user) {
        FileMetadata fileMetadata = fileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("File not found or access denied"));

        return s3Service.generatePresignedUrl(fileMetadata.getS3Key(), fileMetadata.getName());
    }

    /**
     * Normalize category name
     */
    private String normalizeCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return "Others";
        }
        // Simply capitalize the first letter and pass through
        String trimmed = category.trim();
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }

    private String inferCategoryFromType(String filename, String mimeType) {
        if (mimeType != null) {
            if (mimeType.startsWith("image/")) return "Images";
            if (mimeType.startsWith("video/")) return "Videos";
            if (mimeType.startsWith("audio/")) return "Audio";
            if (mimeType.equals("application/pdf")) return "Documents";
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".csv") || lower.endsWith(".xlsx")) return "Spreadsheets";
            if (lower.endsWith(".pdf") || lower.endsWith(".docx")) return "Documents";
            if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "Presentations";
        }
        return "Others";
    }
}
