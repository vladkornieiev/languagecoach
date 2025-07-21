package com.vk.languagecoach.dto;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum AIProvider {
    GROQ, OPENAI;

    @JsonCreator
    public static AIProvider fromString(String provider) {
        try {
            return AIProvider.valueOf(provider.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown provider: " + provider);
        }
    }
}
