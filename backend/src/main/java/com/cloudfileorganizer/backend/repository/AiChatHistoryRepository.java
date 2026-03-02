package com.cloudfileorganizer.backend.repository;

import com.cloudfileorganizer.backend.model.AiChatHistory;
import com.cloudfileorganizer.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatHistoryRepository extends JpaRepository<AiChatHistory, Long> {
    List<AiChatHistory> findByUserOrderByTimestampAsc(User user);
    void deleteByUser(User user);
}
