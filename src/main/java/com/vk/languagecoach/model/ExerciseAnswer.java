package com.vk.languagecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseAnswer {
    private int exerciseId;
    private int position;
    private String answer;
    private String explanation;
}
