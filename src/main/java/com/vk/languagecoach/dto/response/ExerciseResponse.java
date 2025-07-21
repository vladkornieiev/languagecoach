package com.vk.languagecoach.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseResponse {
    private int exerciseId;
    private String text;
}
