package com.vk.languagecoach.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ExercisesResponse {
    private List<ExerciseResponse> exercises;
    private List<ExerciseAnswerResponse> answers;
    private List<ExerciseHintResponse> hints;
}
