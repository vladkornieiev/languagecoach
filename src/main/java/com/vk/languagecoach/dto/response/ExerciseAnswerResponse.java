package com.vk.languagecoach.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseAnswerResponse {
    private int position;
    private String answer;
    private String explanation;
}