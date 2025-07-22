package com.vk.languagecoach.service;

import com.openai.models.audio.transcriptions.Transcription;
import com.openai.models.audio.transcriptions.TranscriptionCreateParams;
import com.vk.languagecoach.dto.AIProvider;
import com.vk.languagecoach.dto.response.SpeechToTextResponse;
import com.vk.languagecoach.service.ai.AIServiceProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.vk.languagecoach.dto.AIModelType.SPEECH_TO_TEXT;

@Service
@Slf4j
public class SpeechToTextService {


    private final AIServiceProvider aiServiceProvider;

    public SpeechToTextService(AIServiceProvider aiServiceProvider) {
        this.aiServiceProvider = aiServiceProvider;
    }

    public List<SpeechToTextResponse> speechToText(MultipartFile[] files, String language, AIProvider provider) throws IOException {
        return Arrays.stream(files)
                .map(file -> {
                    try {
                        return speechToText(file, language, provider);
                    } catch (IOException e) {
                        throw new RuntimeException("Error processing file: " + file.getOriginalFilename(), e);
                    }
                })
                .collect(Collectors.toList());
    }

    public SpeechToTextResponse speechToText(MultipartFile file, String language, AIProvider provider) throws IOException {
        log.info("Processing file: {}, language: {}, provider: {}", file.getOriginalFilename(), language, provider);
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), getFileExtension(file));
        try {
            file.transferTo(tempFile.toPath());

            TranscriptionCreateParams createParams = TranscriptionCreateParams.builder()
                    .file(tempFile.toPath())
                    .model(aiServiceProvider.getModel(provider, SPEECH_TO_TEXT))
                    .build();
            Transcription transcription = aiServiceProvider.getClient(provider)
                    .audio().transcriptions().create(createParams).asTranscription();

            log.info("Processed file: {}, language: {}, provider: {}, transcription: {}",
                    file.getOriginalFilename(), language, provider, transcription.text());

            return SpeechToTextResponse.builder()
                    .language(language)
                    .text(transcription.text())
                    .fileName(file.getOriginalFilename())
                    .build();
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private String getFileExtension(MultipartFile file) {
        int lastDotIndex = file.getOriginalFilename().lastIndexOf(".");
        String fileExtension;
        if (lastDotIndex != -1) {
            fileExtension = file.getOriginalFilename().substring(lastDotIndex);
        } else {
            throw new IllegalArgumentException("File must have an extension");
        }
        return fileExtension;
    }
}
