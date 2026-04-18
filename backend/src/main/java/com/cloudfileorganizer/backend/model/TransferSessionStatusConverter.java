package com.cloudfileorganizer.backend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TransferSessionStatusConverter implements AttributeConverter<TransferSessionStatus, String> {

    @Override
    public String convertToDatabaseColumn(TransferSessionStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Persist canonical enum names so DB check constraints remain compatible.
        return attribute.name();
    }

    @Override
    public TransferSessionStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return TransferSessionStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return TransferSessionStatus.EXPIRED;
        }
    }
}
