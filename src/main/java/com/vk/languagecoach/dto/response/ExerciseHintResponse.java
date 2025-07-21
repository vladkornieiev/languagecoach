package com.vk.languagecoach.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseHintResponse {
    private int exerciseId;
    private int evidence;
    private String hint;
}
