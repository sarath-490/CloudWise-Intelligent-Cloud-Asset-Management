package com.cloudfileorganizer.backend.repository;

import com.cloudfileorganizer.backend.model.TransferPinAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TransferPinAttemptRepository extends JpaRepository<TransferPinAttempt, Long> {

    long countBySessionIdAndCreatedAtAfter(String sessionId, LocalDateTime createdAt);

    long countByIpAddressAndCreatedAtAfter(String ipAddress, LocalDateTime createdAt);

    void deleteByCreatedAtBefore(LocalDateTime createdAt);
}
