package com.cloudfileorganizer.backend.repository;

import com.cloudfileorganizer.backend.model.FileMetadata;
import com.cloudfileorganizer.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileMetadata, String> {
    List<FileMetadata> findByUser(User user);
    Optional<FileMetadata> findByIdAndUser(String id, User user);
    List<FileMetadata> findByUserAndCategory(User user, String category);
    List<FileMetadata> findByUserAndAiCategory(User user, String aiCategory);
    List<FileMetadata> findByUserAndCategoryAndAiCategory(User user, String category, String aiCategory);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(f.size) FROM FileMetadata f")
    Long getTotalStorageSize();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(f.size) FROM FileMetadata f WHERE f.user = :user")
    Long getTotalStorageSizeByUser(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.data.jpa.repository.Query("SELECT f.category, COUNT(f) FROM FileMetadata f WHERE f.user = :user GROUP BY f.category")
    List<Object[]> countFilesByCategory(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.data.jpa.repository.Query("SELECT f.aiCategory, COUNT(f) FROM FileMetadata f WHERE f.user = :user AND f.aiCategory IS NOT NULL GROUP BY f.aiCategory")
    List<Object[]> countFilesByAiCategory(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.data.jpa.repository.Query(
        "SELECT f FROM FileMetadata f WHERE f.user = :user AND " +
        "(LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "OR LOWER(f.aiSummary) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "OR LOWER(f.aiTags) LIKE LOWER(CONCAT('%', :query, '%')))"
    )
    List<FileMetadata> searchFiles(@org.springframework.data.repository.query.Param("user") User user, @org.springframework.data.repository.query.Param("query") String query);
}
