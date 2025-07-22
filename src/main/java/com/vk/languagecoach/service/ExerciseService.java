package com.vk.languagecoach.service;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.StructuredChatCompletion;
import com.openai.models.chat.completions.StructuredChatCompletionCreateParams;
import com.openai.models.completions.CompletionUsage;
import com.vk.languagecoach.dto.AIProvider;
import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExercisesResponse;
import com.vk.languagecoach.service.ai.AIService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ExerciseService {

    private final Map<AIProvider, AIService> aiClients;
    private final Map<AIProvider, String> models = new HashMap<>();
    private Mustache promptTemplate;

    public ExerciseService(List<AIService> aiServices,
                           @Value("${groq.text.model}") String groqModel,
                           @Value("${openai.text.model}") String openAiModel) {
        this.aiClients = aiServices.stream()
                .collect(Collectors.toMap(AIService::getName, Function.identity()));
        this.models.put(AIProvider.GROQ, groqModel);
        this.models.put(AIProvider.OPENAI, openAiModel);
    }

    @PostConstruct
    public void loadPromptTemplate() {
        MustacheFactory mustacheFactory = new DefaultMustacheFactory();
        this.promptTemplate = mustacheFactory.compile("prompts/exercises.mustache");
    }

    public ExercisesResponse generateExercises(ExerciseRequest exerciseRequest) {
        log.info("Generating exercises for request: {}", exerciseRequest);
        AIService aiService = aiClients.get(exerciseRequest.getProvider());
        if (aiService == null) {
            throw new IllegalArgumentException("Unsupported AI provider: " + exerciseRequest.getProvider());
        }

        String model = models.get(exerciseRequest.getProvider());
        if (model == null) {
            throw new IllegalArgumentException("Model not configured for provider: " + exerciseRequest.getProvider());
        }

        Map<String, Object> params = new HashMap<>();
        params.put("language", exerciseRequest.getExerciseLanguage());
        params.put("topic", exerciseRequest.getTopic());
        params.put("level", exerciseRequest.getDifficulty());
        params.put("isIncludeBaseForm", exerciseRequest.isIncludeBaseForm());
        params.put("isIncludeHints", exerciseRequest.isIncludeHints());
        params.put("exerciseCount", exerciseRequest.getTotal());

        StringWriter writer = new StringWriter();
        promptTemplate.execute(writer, params);

        StructuredChatCompletionCreateParams<ExercisesResponse> createParams = ChatCompletionCreateParams.builder()
                .addUserMessage(writer.toString())
                .responseFormat(ExercisesResponse.class)
                .temperature(1)
                .topP(0.95)
                .model(model)
                .build();

        StructuredChatCompletion<ExercisesResponse> exercisesResponseStructuredChatCompletion =
                aiService.getClient()
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
