package com.vk.languagecoach.service;

import com.openai.client.OpenAIClient;
import com.openai.models.audio.transcriptions.Transcription;
import com.openai.models.audio.transcriptions.TranscriptionCreateParams;
import com.vk.languagecoach.dto.AIProvider;
import com.vk.languagecoach.dto.response.SpeechToTextResponse;
import com.vk.languagecoach.service.ai.AIService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.vk.languagecoach.dto.AIProvider.GROQ;

@Service
public class SpeechToTextService {

    private final Map<AIProvider, AIService> aiClients;
    private final Map<AIProvider, String> models = new HashMap<>();

    public SpeechToTextService(List<AIService> aiServices,
                               @Value("${groq.speech-to-text.model}") String groqModel,
                               @Value("${openai.speech-to-text.model}") String openAiModel) {
        this.aiClients = aiServices.stream()
                .collect(Collectors.toMap(AIService::getName, Function.identity()));
        this.models.put(AIProvider.GROQ, groqModel);
        this.models.put(AIProvider.OPENAI, openAiModel);
    }

    public SpeechToTextResponse speechToText(MultipartFile file, String language, AIProvider provider) throws IOException {
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), getFileExtension(file));
        try {
            file.transferTo(tempFile.toPath());

            AIService aiService = aiClients.get(provider);
            if (aiService == null) {
                throw new IllegalArgumentException("Unsupported AI provider: " + provider);
            }

            String model = models.get(provider);
            if (model == null) {
                throw new IllegalArgumentException("Model not configured for provider: " + provider);
            }

            TranscriptionCreateParams createParams = TranscriptionCreateParams.builder()
                    .file(tempFile.toPath())
                    .model(model)
                    .build();
            Transcription transcription = aiService.getClient()
                    .audio().transcriptions().create(createParams).asTranscription();

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
