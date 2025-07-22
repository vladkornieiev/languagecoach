package com.vk.languagecoach.service.ai;

import com.openai.client.OpenAIClient;
import com.vk.languagecoach.dto.AIProvider;

public interface AIService {

    OpenAIClient getClient();
    AIProvider getName();
}
