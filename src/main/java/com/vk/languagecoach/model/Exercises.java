package com.vk.languagecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class Exercises {
    private List<Exercise> exercises;
    private List<ExerciseAnswer> answers;
    private List<ExerciseHint> hints;
}
