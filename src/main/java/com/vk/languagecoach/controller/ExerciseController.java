package com.vk.languagecoach.controller;

import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExerciseResponse;
import com.vk.languagecoach.mapper.ExerciseMapper;
import com.vk.languagecoach.model.Exercises;
import com.vk.languagecoach.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    private final ExerciseMapper exerciseMapper;

    @PostMapping
    public ResponseEntity<List<ExerciseResponse>> generateExercises(@RequestBody ExerciseRequest exerciseRequest) {
        Exercises exercises = exerciseService.generateExercises(exerciseRequest);
        return ResponseEntity.ok(exerciseMapper.mapToExerciseResponses(exercises));
    }
}
