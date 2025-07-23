package com.vk.languagecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ExercisesStep2 {
    private List<ExerciseWithAnswerStep2> exercisesWithAnswers;
}
