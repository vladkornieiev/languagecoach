package com.vk.languagecoach.mapper;

import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExerciseAnswerResponse;
import com.vk.languagecoach.dto.response.ExerciseHintResponse;
import com.vk.languagecoach.dto.response.ExerciseResponse;
import com.vk.languagecoach.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class ExerciseMapper {

    public List<ExerciseResponse> mapToExerciseResponses(ExerciseRequest request, ExercisesStep2 exercises) {
        if (exercises == null) {
            return List.of();
        }

        List<ExerciseWithAnswerStep2> exercisesWithAnswers = exercises.getExercisesWithAnswers();
        return exercisesWithAnswers.stream()
                .map(exerciseWithAnswer -> {
                    String text = request.isIncludeBaseForm() ? toTextWithBaseForms(exerciseWithAnswer) : exerciseWithAnswer.getExercise();
                    List<ExerciseAnswerStep2> answers = exerciseWithAnswer.getAnswers();
                    return new ExerciseResponse(
                            text,
                            answers.stream()
                                    .map(answer -> new ExerciseAnswerResponse(
                                            answer.getPosition(),
                                            answer.getAnswer(),
                                            answer.getExplanation()))
                                    .collect(Collectors.toList()),
                            List.of() // Hints are not included in this step
                    );
                })
                .collect(Collectors.toList());
    }

    private String toTextWithBaseForms(ExerciseWithAnswerStep2 exerciseWithAnswerStep2) {
        Map<Integer, String> baseFormByPosition = exerciseWithAnswerStep2.getAnswers().stream()
                .collect(Collectors.toMap(
                        ExerciseAnswerStep2::getPosition,
                        ExerciseAnswerStep2::getBaseForm,
                        (s1, s2) -> s1
                ));

        String originalText = exerciseWithAnswerStep2.getExercise(); // assuming this method exists
        Matcher matcher = Pattern.compile("___").matcher(originalText);
        StringBuffer result = new StringBuffer();
        int blankIndex = 0; // zero-based

        while (matcher.find()) {
            String baseForm = baseFormByPosition.get(blankIndex);
            String replacement = baseForm != null ? "___ (" + baseForm + ")" : "___";
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
            blankIndex++;
        }
        matcher.appendTail(result);
        return result.toString();
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