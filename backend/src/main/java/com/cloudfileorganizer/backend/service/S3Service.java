package com.cloudfileorganizer.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.url-expiration-minutes:60}")
    private int urlExpirationMinutes;

    @Value("${aws.region}")
    private String region;

    public String getBucketName() {
        return bucketName;
    }

    /**
     * Upload file to S3
     * @param file MultipartFile to upload
     * @param category Category folder name
     * @param userId User ID for organization
     * @return S3 object key
     */
    public String uploadFile(MultipartFile file, String category, Long userId) throws IOException {
        try {
            // Generate unique S3 key: users/{userId}/uploads/uuid-originalFilename
            String fileName = file.getOriginalFilename();
            String fileExtension = fileName != null && fileName.contains(".") 
                ? fileName.substring(fileName.lastIndexOf(".")) 
                : "";
            String uniqueFileName = UUID.randomUUID().toString() + "-" + fileName;
            String s3Key = "users/" + userId + "/uploads/" + uniqueFileName;

            // Prepare metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("original-filename", fileName != null ? fileName : "unknown");
            metadata.put("uploaded-by", userId.toString());
            metadata.put("category", category);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .serverSideEncryption(ServerSideEncryption.AES256)
                    .metadata(metadata)
                    .build();

            // Upload file
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return s3Key;
        } catch (Exception e) {
            throw new IOException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    /**
     * Generate pre-signed URL for file download
     * @param s3Key S3 object key
     * @return Pre-signed URL
     */
    public String generatePresignedUrl(String s3Key, String originalFileName) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .responseContentDisposition("attachment; filename=\"" + originalFileName + "\"")
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(urlExpirationMinutes))
                    .getObjectRequest(getObjectRequest)
                    .build();

            S3Presigner presigner = S3Presigner.builder()
                    .region(Region.of(region))
                    .build();
            
            try {
                PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
                return presignedRequest.url().toString();
            } finally {
                presigner.close();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage(), e);
        }
    }

    /**
     * Get file content stream from S3 for proxied download
     * @param s3Key S3 object key
     * @return InputStream of file content
     */
    public java.io.InputStream getFileStream(String s3Key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            return s3Client.getObject(getObjectRequest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get file from S3: " + e.getMessage(), e);
        }
    }

    /**
     * Delete file from S3
     * @param s3Key S3 object key
     */
    public void deleteFile(String s3Key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        }
    }

    /**
     * Check if file exists in S3
     * @param s3Key S3 object key
     * @return true if file exists
     */
    public boolean fileExists(String s3Key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return false;
            }
            throw new RuntimeException("Failed to check file existence: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to check file existence: " + e.getMessage(), e);
        }
    }

    /**
     * Get file content type from S3
     * @param s3Key S3 object key
     * @return Content type
     */
    public String getContentType(String s3Key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            HeadObjectResponse response = s3Client.headObject(headObjectRequest);
            return response.contentType();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get content type: " + e.getMessage(), e);
        }
    }
}
