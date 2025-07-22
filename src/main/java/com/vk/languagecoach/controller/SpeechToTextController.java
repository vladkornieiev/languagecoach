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
import java.util.List;

import static com.vk.languagecoach.dto.AIProvider.fromString;

@RestController
@RequestMapping("/api/speech-to-text")
@RequiredArgsConstructor
public class SpeechToTextController {


    private final SpeechToTextService speechToTextService;

    @PostMapping
    public ResponseEntity<List<SpeechToTextResponse>> speechToText(@RequestParam("files") MultipartFile[] files,
                                                                   @Param("language") String language,
                                                                   @Param("prodiver") String provider) throws IOException {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Files must not be empty");
        }

        List<SpeechToTextResponse> transcription = speechToTextService.speechToText(files, language, fromString(provider));
        return ResponseEntity.ok(transcription);
    }
}
