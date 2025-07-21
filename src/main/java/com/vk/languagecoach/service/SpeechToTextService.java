package com.vk.languagecoach.service;

import com.openai.client.OpenAIClient;
import com.openai.models.audio.transcriptions.Transcription;
import com.openai.models.audio.transcriptions.TranscriptionCreateParams;
import com.vk.languagecoach.dto.AIProvider;
import com.vk.languagecoach.dto.response.SpeechToTextResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import static com.vk.languagecoach.dto.AIProvider.GROQ;

@Service
public class SpeechToTextService {

    private final OpenAIClient openAIClient;
    private final OpenAIClient groqClient;
    private final String groqModel;
    private final String openAiModel;

    public SpeechToTextService(@Qualifier("openAIClient") OpenAIClient openAIClient,
                               @Qualifier("groqClient") OpenAIClient groqClient,
                               @Value("${groq.speech-to-text.model}") String groqModel,
                               @Value("${openai.speech-to-text.model}") String openAiModel) {
        this.openAIClient = openAIClient;
        this.groqClient = groqClient;
        this.groqModel = groqModel;
        this.openAiModel = openAiModel;
    }

    public SpeechToTextResponse speechToText(MultipartFile file, String language, AIProvider provider) throws IOException {
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), getFileExtension(file));
        try {
            file.transferTo(tempFile.toPath());

            String model = provider == GROQ ? groqModel : openAiModel;
            OpenAIClient client = provider == GROQ ? groqClient : openAIClient;

            TranscriptionCreateParams createParams = TranscriptionCreateParams.builder()
                    .file(tempFile.toPath())
                    .model(model)
                    .build();
            Transcription transcription = client.audio().transcriptions().create(createParams).asTranscription();

            return SpeechToTextResponse.builder()
                    .language(language)
                    .text(transcription.text())
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
