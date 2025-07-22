package com.vk.languagecoach.service.ai;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.vk.languagecoach.dto.AIProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GroqService implements AIService {

    @Value("${groq.api-key}")
    private String groqApiKey;
    @Value("${groq.base-url}")
    private String groqBaseUrl;

    private final OpenAIClient client;

    public GroqService() {
        this.client = OpenAIOkHttpClient.builder()
                .apiKey(groqApiKey)
                .baseUrl(groqBaseUrl)
                .build();
    }

    @Override
    public OpenAIClient getClient() {
        return this.client;
    }

    @Override
    public AIProvider getName() {
        return AIProvider.GROQ;
    }
}
