package com.cloudfileorganizer.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class TransferSchemaCompatibilityFix {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransferSchemaCompatibilityFix.class);

    private final JdbcTemplate jdbcTemplate;

    public TransferSchemaCompatibilityFix(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void applySchemaFixes() {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE transfer_sessions ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT"
            );
            jdbcTemplate.execute(
                    "ALTER TABLE transfer_sessions ADD COLUMN IF NOT EXISTS encrypted_pin VARCHAR(1024)"
            );
            LOGGER.info("Applied transfer_sessions compatibility schema fixes");
        } catch (Exception ex) {
            // Do not fail app startup for compatibility fixes; normal migrations can still proceed.
            LOGGER.warn("Could not apply transfer_sessions compatibility schema fixes: {}", ex.getMessage());
        }
    }
}
