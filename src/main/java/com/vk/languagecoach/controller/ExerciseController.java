package com.vk.languagecoach.controller;

import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExercisesResponse;
import com.vk.languagecoach.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {


    private final ExerciseService exerciseService;

    @PostMapping
    public ResponseEntity<ExercisesResponse> generateExercises(@RequestBody ExerciseRequest exerciseRequest) {
        ExercisesResponse exercisesResponse = exerciseService.generateExercises(exerciseRequest);
        return ResponseEntity.ok(exercisesResponse);
    }
}
