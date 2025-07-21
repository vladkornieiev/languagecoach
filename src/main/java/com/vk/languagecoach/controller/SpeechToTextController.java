package com.vk.languagecoach.controller;

import com.vk.languagecoach.dto.response.SpeechToTextResponse;
import com.vk.languagecoach.service.SpeechToTextService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static com.vk.languagecoach.dto.AIProvider.fromString;

@RestController
@RequestMapping("/api/speech-to-text")
@RequiredArgsConstructor
public class SpeechToTextController {


    private final SpeechToTextService speechToTextService;

    @PostMapping
    public ResponseEntity<SpeechToTextResponse> uploadAudio(@RequestParam("file") MultipartFile file,
                                                            @Param("language") String language,
                                                            @Param("prodiver") String provider) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        SpeechToTextResponse transcription = speechToTextService.speechToText(file, language, fromString(provider));
        return ResponseEntity.ok(transcription);
    }
}
