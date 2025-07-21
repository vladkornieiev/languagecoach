package com.vk.languagecoach.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseAnswerResponse {
    private int exerciseId;
    private int position;
    private String answer;
    private String explanation;
}
