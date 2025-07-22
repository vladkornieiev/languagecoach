package com.vk.languagecoach.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExerciseHint {
    private int exerciseId;
    private int evidence;
    private String hint;
}
