package com.vk.languagecoach.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseResponse {
    private String text;
    private List<ExerciseAnswerResponse> answers;
    private List<ExerciseHintResponse> hints;
}