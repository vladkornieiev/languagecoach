package com.vk.languagecoach.mapper;

import com.vk.languagecoach.dto.response.ExerciseResponse;
import com.vk.languagecoach.model.Exercises;
import com.vk.languagecoach.model.Exercise;
import com.vk.languagecoach.model.ExerciseAnswer;
import com.vk.languagecoach.model.ExerciseHint;
import com.vk.languagecoach.dto.response.ExerciseAnswerResponse;
import com.vk.languagecoach.dto.response.ExerciseHintResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ExerciseMapper {

    public List<ExerciseResponse> mapToExerciseResponses(Exercises exercises) {
        if (exercises == null) {
            return List.of();
        }

        // Group answers by exerciseId
        Map<Integer, List<ExerciseAnswer>> answersByExerciseId = 
            exercises.getAnswers() != null ? 
                exercises.getAnswers().stream()
                    .collect(Collectors.groupingBy(ExerciseAnswer::getExerciseId)) :
                Map.of();

        // Group hints by exerciseId
        Map<Integer, List<ExerciseHint>> hintsByExerciseId = 
            exercises.getHints() != null ? 
                exercises.getHints().stream()
                    .collect(Collectors.groupingBy(ExerciseHint::getExerciseId)) :
                Map.of();

        // Map exercises to unified format
        return exercises.getExercises() != null ?
            exercises.getExercises().stream()
                .map(exercise -> mapToExerciseResponse(exercise, answersByExerciseId, hintsByExerciseId))
                .collect(Collectors.toList()) :
            List.of();
    }

    private ExerciseResponse mapToExerciseResponse(
            Exercise exercise,
            Map<Integer, List<ExerciseAnswer>> answersByExerciseId,
            Map<Integer, List<ExerciseHint>> hintsByExerciseId) {

        int exerciseId = exercise.getExerciseId();

        // Map answers for this exercise
        List<ExerciseAnswerResponse> answers = answersByExerciseId.getOrDefault(exerciseId, List.of())
                .stream()
                .map(answer -> ExerciseAnswerResponse.builder()
                        .position(answer.getPosition())
                        .answer(answer.getAnswer())
                        .explanation(answer.getExplanation())
                        .build())
                .collect(Collectors.toList());

        // Map hints for this exercise
        List<ExerciseHintResponse> hints = hintsByExerciseId.getOrDefault(exerciseId, List.of())
                .stream()
                .map(hint -> ExerciseHintResponse.builder()
                        .evidence(hint.getEvidence())
                        .hint(hint.getHint())
                        .build())
                .collect(Collectors.toList());

        return ExerciseResponse.builder()
                .text(exercise.getText())
                .answers(answers)
                .hints(hints)
                .build();
    }
} 