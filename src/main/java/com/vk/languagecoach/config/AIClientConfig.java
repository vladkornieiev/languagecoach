package com.vk.languagecoach.config;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIClientConfig {

    @Value("${groq.api-key}")
    private String groqApiKey;
    @Value("${groq.base-url}")
    private String groqBaseUrl;
    @Value("${openai.api-key}")
    private String openAiApiKey;

    @Bean
    public OpenAIClient openAIClient() {
        return OpenAIOkHttpClient.builder()
                .apiKey(openAiApiKey)
                .build();
    }

    @Bean
    public OpenAIClient groqClient() {
        return OpenAIOkHttpClient.builder()
                .apiKey(groqApiKey)
                .baseUrl(groqBaseUrl)
                .build();
    }
}
