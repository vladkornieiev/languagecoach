package com.vk.languagecoach.service.ai;

import com.openai.client.OpenAIClient;
import com.vk.languagecoach.dto.AIModelType;
import com.vk.languagecoach.dto.AIProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIServiceProvider {

    private Map<AIProvider, OpenAIClient> aiServices;
    private Map<AIProvider, String> textModels;
    private Map<AIProvider, String> textToSpeechModels;
    private Map<AIProvider, String> speechToTextModels;

    public AIServiceProvider(List<AIService> aiServices,
                             @Value("${groq.text.model}") String groqTextModel,
                             @Value("${openai.text.model}") String openAiTextModel,
                             @Value("${groq.speech-to-text.model}") String groqSpeechToTextModel,
                             @Value("${openai.speech-to-text.model}") String openAiSpeechToTextModel,
                             @Value("${openai.text-to-speech.model}") String openAiTextToSpeechModel) {
        this.aiServices = aiServices.stream()
                .collect(Collectors.toMap(AIService::getName, AIService::getClient));
        this.textModels = Map.of(
                AIProvider.GROQ, groqTextModel,
                AIProvider.OPENAI, openAiTextModel
        );
        this.speechToTextModels = Map.of(
                AIProvider.GROQ, groqSpeechToTextModel,
                AIProvider.OPENAI, openAiSpeechToTextModel
        );
        this.textToSpeechModels = Map.of(
                AIProvider.OPENAI, openAiTextToSpeechModel
        );
    }

    public OpenAIClient getClient(AIProvider provider) {
        OpenAIClient client = aiServices.get(provider);
        if (client == null) {
            throw new IllegalArgumentException("Unsupported AI provider: " + provider);
        }
        return client;
    }

    public String getModel(AIProvider provider, AIModelType type) {
        Map<AIProvider, String> models = switch (type) {
            case TEXT -> textModels;
            case SPEECH_TO_TEXT -> speechToTextModels;
            case TEXT_TO_SPEECH -> textToSpeechModels;
        };

        String model = models.get(provider);
        if (model == null) {
            throw new IllegalArgumentException("Model not configured for provider: " + provider);
        }
        return model;
    }
}
