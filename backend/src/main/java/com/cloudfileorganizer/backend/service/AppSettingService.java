package com.cloudfileorganizer.backend.service;

import com.cloudfileorganizer.backend.model.AppSetting;
import com.cloudfileorganizer.backend.repository.AppSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AppSettingService {

    public static final String KEY_UPLOAD_MAX_FILE_SIZE_BYTES = "upload.maxFileSizeBytes";
    public static final String KEY_TRANSFER_DEFAULT_EXPIRY_MINUTES = "transfer.defaultExpiryMinutes";
    public static final String KEY_TRANSFER_DEFAULT_MAX_DOWNLOADS = "transfer.defaultMaxDownloads";
    public static final String KEY_TRANSFER_MAX_FILE_SIZE_BYTES = "transfer.maxFileSizeBytes";
    public static final String KEY_DEFAULT_USER_STORAGE_LIMIT_BYTES = "user.defaultStorageLimitBytes";

    @Autowired
    private AppSettingRepository appSettingRepository;

    public Long getLong(String key, Long fallback) {
        return appSettingRepository.findById(key)
                .map(AppSetting::getValue)
                .map(this::toLong)
                .orElse(fallback);
    }

    public Integer getInt(String key, Integer fallback) {
        return appSettingRepository.findById(key)
                .map(AppSetting::getValue)
                .map(this::toInt)
                .orElse(fallback);
    }

    public void set(String key, Object value) {
        String stored = value == null ? null : String.valueOf(value);
        if (stored == null || stored.isBlank()) {
            appSettingRepository.deleteById(key);
            return;
        }
        appSettingRepository.save(new AppSetting(key, stored));
    }

    public Map<String, Object> getEffectiveSettings(Long uploadMaxFileSizeBytes,
                                                    Integer transferDefaultExpiryMinutes,
                                                    Integer transferDefaultMaxDownloads,
                                                    Long transferMaxFileSizeBytes,
                                                    Long defaultUserStorageLimitBytes) {
        Map<String, Object> data = new HashMap<>();
        data.put("uploadMaxFileSizeBytes", getLong(KEY_UPLOAD_MAX_FILE_SIZE_BYTES, uploadMaxFileSizeBytes));
        data.put("transferDefaultExpiryMinutes", getInt(KEY_TRANSFER_DEFAULT_EXPIRY_MINUTES, transferDefaultExpiryMinutes));
        data.put("transferDefaultMaxDownloads", getInt(KEY_TRANSFER_DEFAULT_MAX_DOWNLOADS, transferDefaultMaxDownloads));
        data.put("transferMaxFileSizeBytes", getLong(KEY_TRANSFER_MAX_FILE_SIZE_BYTES, transferMaxFileSizeBytes));
        data.put("defaultUserStorageLimitBytes", getLong(KEY_DEFAULT_USER_STORAGE_LIMIT_BYTES, defaultUserStorageLimitBytes));
        return data;
    }

    private Long toLong(String raw) {
        try {
            return Long.parseLong(raw);
        } catch (Exception ex) {
            return null;
        }
    }

    private Integer toInt(String raw) {
        try {
            return Integer.parseInt(raw);
        } catch (Exception ex) {
            return null;
        }
    }
}
