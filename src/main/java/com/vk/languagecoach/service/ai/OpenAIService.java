package com.vk.languagecoach.service.ai;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.vk.languagecoach.dto.AIProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenAIService implements AIService {

    private final OpenAIClient client;

    public OpenAIService(@Value("${openai.api-key}") String apiKey) {
        this.client = OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .build();
    }

    @Override
    public OpenAIClient getClient() {
        return this.client;
    }

    @Override
    public AIProvider getName() {
        return AIProvider.OPENAI;
    }
}
