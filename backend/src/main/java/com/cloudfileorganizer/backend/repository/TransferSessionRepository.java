package com.cloudfileorganizer.backend.repository;

import com.cloudfileorganizer.backend.model.TransferSession;
import com.cloudfileorganizer.backend.model.TransferSessionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransferSessionRepository extends JpaRepository<TransferSession, Long> {

    Optional<TransferSession> findBySessionId(String sessionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TransferSession> findBySessionIdAndStatusNot(String sessionId, TransferSessionStatus status);

    List<TransferSession> findByExpiresAtBeforeAndStatusNot(LocalDateTime expiresAt, TransferSessionStatus status);

    List<TransferSession> findByExpiresAtAfterAndStatusNot(LocalDateTime expiresAt, TransferSessionStatus status);

    List<TransferSession> findByCreatedByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(Long createdByUserId, LocalDateTime expiresAt);
}
