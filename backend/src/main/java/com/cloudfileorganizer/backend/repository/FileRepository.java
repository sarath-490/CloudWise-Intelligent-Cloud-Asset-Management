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

    @org.springframework.data.jpa.repository.Query("SELECT SUM(f.size) FROM FileMetadata f")
    Long getTotalStorageSize();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(f.size) FROM FileMetadata f WHERE f.user = :user")
    Long getTotalStorageSizeByUser(@org.springframework.data.repository.query.Param("user") User user);
}
