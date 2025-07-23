package com.vk.languagecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseAnswerStep2 {
    private int position;
    private String answer;
    private String explanation;
    private String baseForm;
}
