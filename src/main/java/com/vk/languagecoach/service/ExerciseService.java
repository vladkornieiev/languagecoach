package com.vk.languagecoach.service;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.StructuredChatCompletion;
import com.openai.models.chat.completions.StructuredChatCompletionCreateParams;
import com.openai.models.completions.CompletionUsage;
import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.model.ExercisesStep1;
import com.vk.languagecoach.model.ExercisesStep2;
import com.vk.languagecoach.service.ai.AIServiceProvider;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
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
    private Mustache promptTemplate1;
    private Mustache promptTemplate2;

    public ExerciseService(AIServiceProvider aiServiceProvider) {
        this.aiServiceProvider = aiServiceProvider;
    }

    @PostConstruct
    public void loadPromptTemplate() {
        MustacheFactory mustacheFactory = new DefaultMustacheFactory();
        this.promptTemplate1 = mustacheFactory.compile("prompts/exercises-1.mustache");
        this.promptTemplate2 = mustacheFactory.compile("prompts/exercises-2.mustache");
    }

    public ExercisesStep2 generateExercises(ExerciseRequest exerciseRequest) {
        log.info("Generating exercises for request: {}", exerciseRequest);

        StepResult<ExercisesStep1> step1 = step1(exerciseRequest);
        StepResult<ExercisesStep2> step2 = step2(exerciseRequest, step1.result);

        log.info("Generated exercises using model: {}, completion tokens: {}, prompt tokens: {}, request: {}",
                aiServiceProvider.getModel(exerciseRequest.getProvider(), TEXT),
                step1.completionTokens + step2.completionTokens,
                step1.promptTokens + step2.promptTokens,
                exerciseRequest);

        return step2.result;
    }

    private StepResult<ExercisesStep2> step2(ExerciseRequest exerciseRequest, ExercisesStep1 exercisesStep1) {
        Map<String, Object> params2 = new HashMap<>();
        params2.put("exerciseLanguage", exerciseRequest.getExerciseLanguage());
        params2.put("userLanguage", exerciseRequest.getUserLanguage());
        params2.put("topic", exerciseRequest.getTopic());
        params2.put("level", exerciseRequest.getDifficulty());
        params2.put("isIncludeBaseForm", exerciseRequest.isIncludeBaseForm());
        params2.put("isIncludeHints", exerciseRequest.isIncludeHints());
        params2.put("exerciseCount", exerciseRequest.getTotal());
        params2.put("input", String.join("\n", exercisesStep1.getExercises()));

        StringWriter writer2 = new StringWriter();
        promptTemplate2.execute(writer2, params2);


        StructuredChatCompletionCreateParams<ExercisesStep2> chatParams2 = ChatCompletionCreateParams.builder()
                .addUserMessage(writer2.toString())
                .responseFormat(ExercisesStep2.class)
                .model(aiServiceProvider.getModel(exerciseRequest.getProvider(), TEXT))
                .build();

        StructuredChatCompletion<ExercisesStep2> completion2 =
                aiServiceProvider.getClient(exerciseRequest.getProvider())
                        .chat()
                        .completions()
                        .create(chatParams2);

        ExercisesStep2 response1 = completion2
                .choices()
                .getFirst()
                .message()
                .content()
                .orElseThrow(() -> new IllegalStateException("No content in the response"));
        return new StepResult<>(completion2.rawChatCompletion().usage().get(), response1);
    }

    private StepResult<ExercisesStep1> step1(ExerciseRequest exerciseRequest) {
        Map<String, Object> params1 = new HashMap<>();
        params1.put("exerciseLanguage", exerciseRequest.getExerciseLanguage());
        params1.put("userLanguage", exerciseRequest.getUserLanguage());
        params1.put("topic", exerciseRequest.getTopic());
        params1.put("level", exerciseRequest.getDifficulty());
        params1.put("isIncludeBaseForm", exerciseRequest.isIncludeBaseForm());
        params1.put("isIncludeHints", exerciseRequest.isIncludeHints());
        params1.put("exerciseCount", exerciseRequest.getTotal());
        StringWriter writer1 = new StringWriter();
        promptTemplate1.execute(writer1, params1);


        StructuredChatCompletionCreateParams<ExercisesStep1> chatParams1 = ChatCompletionCreateParams.builder()
                .addUserMessage(writer1.toString())
                .responseFormat(ExercisesStep1.class)
                .model(aiServiceProvider.getModel(exerciseRequest.getProvider(), TEXT))
                .build();

        StructuredChatCompletion<ExercisesStep1> completion1 = aiServiceProvider.getClient(exerciseRequest.getProvider())
                .chat()
                .completions()
                .create(chatParams1);

        ExercisesStep1 response1 = completion1
                .choices()
                .getFirst()
                .message()
                .content()
                .orElseThrow(() -> new IllegalStateException("No content in the response"));
        return new StepResult<>(completion1.rawChatCompletion().usage().get(), response1);
    }

    @Data
    @AllArgsConstructor
    private static class StepResult<T> {
        private final long completionTokens;
        private final long promptTokens;
        private final T result;

        private StepResult(CompletionUsage usage, T result) {
            this.completionTokens = usage.completionTokens();
            this.promptTokens = usage.promptTokens();
            this.result = result;
        }
    }
}
