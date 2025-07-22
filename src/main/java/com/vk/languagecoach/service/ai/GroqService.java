package com.vk.languagecoach.service.ai;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.vk.languagecoach.dto.AIProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GroqService implements AIService {

    private final OpenAIClient client;

    public GroqService(@Value("${groq.api-key}") String apiKey, @Value("${groq.base-url}") String baseUrl) {
        this.client = OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
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
