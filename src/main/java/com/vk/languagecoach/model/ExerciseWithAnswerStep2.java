package com.vk.languagecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ExerciseWithAnswerStep2 {
    private String exercise;
    private List<ExerciseAnswerStep2> answers;
}
