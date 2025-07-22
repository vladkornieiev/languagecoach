package com.vk.languagecoach.service;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.StructuredChatCompletion;
import com.openai.models.chat.completions.StructuredChatCompletionCreateParams;
import com.openai.models.completions.CompletionUsage;
import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExercisesResponse;
import com.vk.languagecoach.service.ai.AIServiceProvider;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import static com.vk.languagecoach.dto.AIModelType.TEXT;

@Service
@Slf4j
public class ExerciseService {

    private final AIServiceProvider aiServiceProvider;
    private Mustache promptTemplate;

    public ExerciseService(AIServiceProvider aiServiceProvider) {
        this.aiServiceProvider = aiServiceProvider;
    }

    @PostConstruct
    public void loadPromptTemplate() {
        MustacheFactory mustacheFactory = new DefaultMustacheFactory();
        this.promptTemplate = mustacheFactory.compile("prompts/exercises.mustache");
    }

    public ExercisesResponse generateExercises(ExerciseRequest exerciseRequest) {
        log.info("Generating exercises for request: {}", exerciseRequest);

        Map<String, Object> params = new HashMap<>();
        params.put("exerciseLanguage", exerciseRequest.getExerciseLanguage());
        params.put("userLanguage", exerciseRequest.getUserLanguage());
        params.put("topic", exerciseRequest.getTopic());
        params.put("level", exerciseRequest.getDifficulty());
        params.put("isIncludeBaseForm", exerciseRequest.isIncludeBaseForm());
        params.put("isIncludeHints", exerciseRequest.isIncludeHints());
        params.put("exerciseCount", exerciseRequest.getTotal());

        StringWriter writer = new StringWriter();
        promptTemplate.execute(writer, params);

        String model = aiServiceProvider.getModel(exerciseRequest.getProvider(), TEXT);
        StructuredChatCompletionCreateParams<ExercisesResponse> createParams = ChatCompletionCreateParams.builder()
                .addUserMessage(writer.toString())
                .responseFormat(ExercisesResponse.class)
                .temperature(1.75)
                .topP(0.95)
                .model(model)
                .build();

        StructuredChatCompletion<ExercisesResponse> exercisesResponseStructuredChatCompletion =
                aiServiceProvider.getClient(exerciseRequest.getProvider())
                        .chat()
                        .completions()
                        .create(createParams);

        CompletionUsage usage = exercisesResponseStructuredChatCompletion.rawChatCompletion().usage().get();
        long completionTokens = usage.completionTokens();
        long promptTokens = usage.promptTokens();

        log.info("Generated exercises using model: {}, completion tokens: {}, prompt tokens: {}, request: {}",
                model, completionTokens, promptTokens, exerciseRequest);

        return exercisesResponseStructuredChatCompletion
                .choices()
                .getFirst()
                .message()
                .content()
                .orElseThrow(() -> new IllegalStateException("No content in the response"));
    }
}
