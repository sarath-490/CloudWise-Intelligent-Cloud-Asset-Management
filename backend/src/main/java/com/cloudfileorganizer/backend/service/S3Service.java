package com.cloudfileorganizer.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.core.ResponseInputStream;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Autowired
    private S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.url-expiration-minutes:60}")
    private int urlExpirationMinutes;

    public String getBucketName() {
        return bucketName;
    }

    public static class PresignedPutPayload {
        private final String url;
        private final Map<String, String> signedHeaders;

        public PresignedPutPayload(String url, Map<String, String> signedHeaders) {
            this.url = url;
            this.signedHeaders = signedHeaders;
        }

        public String getUrl() {
            return url;
        }

        public Map<String, String> getSignedHeaders() {
            return signedHeaders;
        }
    }

    public static class S3ObjectPayload {
        private final java.io.InputStream stream;
        private final String contentType;
        private final Long contentLength;

        public S3ObjectPayload(java.io.InputStream stream, String contentType, Long contentLength) {
            this.stream = stream;
            this.contentType = contentType;
            this.contentLength = contentLength;
        }

        public java.io.InputStream getStream() {
            return stream;
        }

        public String getContentType() {
            return contentType;
        }

        public Long getContentLength() {
            return contentLength;
        }
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

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage(), e);
        }
    }

    public String generatePresignedGetUrl(String s3Key, Duration expiry, String originalFileName) {
        try {
            GetObjectRequest.Builder requestBuilder = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key);

            if (originalFileName != null && !originalFileName.isBlank()) {
                requestBuilder.responseContentDisposition("attachment; filename=\"" + originalFileName + "\"");
            }

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .getObjectRequest(requestBuilder.build())
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate presigned GET URL: " + e.getMessage(), e);
        }
    }

    public PresignedPutPayload generatePresignedPutUrl(String s3Key, String contentType, Duration expiry) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .putObjectRequest(putObjectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
            Map<String, String> headers = new HashMap<>();
            presignedRequest.signedHeaders().forEach((key, values) -> {
                if (values != null && !values.isEmpty()) {
                    headers.put(key, String.join(",", values));
                }
            });

            return new PresignedPutPayload(presignedRequest.url().toString(), headers);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate presigned PUT URL: " + e.getMessage(), e);
        }
    }

    /**
     * Get file content stream from S3 for proxied download
     * @param s3Key S3 object key
     * @return InputStream of file content
     */
    public java.io.InputStream getFileStream(String s3Key) {
        return getFileWithMetadata(s3Key).getStream();
    }

    public S3ObjectPayload getFileWithMetadata(String s3Key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            ResponseInputStream<GetObjectResponse> responseStream = s3Client.getObject(getObjectRequest);
            GetObjectResponse response = responseStream.response();
            return new S3ObjectPayload(
                    responseStream,
                    response.contentType(),
                    response.contentLength()
            );
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
