package com.vk.languagecoach.dto;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ExerciseDifficulty {
    A1, A2, B1, B2, C1, C2;

    @JsonCreator
    public static ExerciseDifficulty fromString(String value) {
        try {
            return ExerciseDifficulty.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid difficulty level: " + value);
        }
    }
}
