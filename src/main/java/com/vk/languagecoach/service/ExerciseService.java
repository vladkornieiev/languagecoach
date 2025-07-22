package com.vk.languagecoach.service;

import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.StructuredChatCompletion;
import com.openai.models.chat.completions.StructuredChatCompletionCreateParams;
import com.openai.models.completions.CompletionUsage;
import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExercisesResponse;
import com.vk.languagecoach.service.ai.AIServiceProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import static com.vk.languagecoach.dto.AIModelType.TEXT;

@Service
@Slf4j
public class ExerciseService {

    private final AIServiceProvider aiServiceProvider;

    public ExerciseService(AIServiceProvider aiServiceProvider) {
        this.aiServiceProvider = aiServiceProvider;
    }

    public ExercisesResponse generateExercises(ExerciseRequest exerciseRequest) {
        log.info("Generating exercises for request: {}", exerciseRequest);

        String baseForm = exerciseRequest.isIncludeBaseForm() ? """
                (infinitive form or additional context here - it CAN NOT be the correct word (answer to the exercise),
                if it is a correct answer to the exercise,
                ignore it - do not add anything in parentheses after the blanks (___) in the exercise text.")
                """ : "";
        String prompt = """
                I want to practice my %s language skills. Please generate exercises/phrases with empty spaces (___) to fill in.
                Exercises topic is: %s.
                The exercises should be suitable for a %s level learner. Example of the exercise:
                "I like to ___%s in the morning."
                The phrase/sentence may contain multiple blanks (especially for higher difficulty levels). For example:
                "I like to ___ in the morning and ___ in the evening."
                Use 'position' to indicate the answer for each blank, starting from zero.
                Make sure that exercises are relevant to the topic and difficulty level and the exercises are in the %s language.
                If there are multiple correct answers, provide them all - with the same 'exerciseId' and 'position' value. 
                For example, in some languages, the verb conjugation may vary based on the subject, so provide all possible answers for the same exercise.
                Example: Ти вчора ___ (читати) книжку? - Correct answers are "читав", "читала" (for different subjects). 
                %s
                %s
                Also, add explanation for each answer in %s language.
                Make sure 'exerciseId' is unique for each exercise, starts from 0, and consistent across exercises/answers/hints.
                Be creative and generate a variety of exercises.
                MAKE SURE to NOT include the correct answer in the exercise text itself, especially after the blanks (___).
                Total exercises should be %d.
                
                Example of the exercise texts:
                - with base form: Ayer ___ (ir, yo) al cine. - only when it's not obvious who the subject is.
                - with base form: Ayer yo ___(ir) al cine. - no need to include the subject if it's obvious.
                - without base form: Ayer yo ___ al cine.
                """.formatted(
                exerciseRequest.getExerciseLanguage(),
                exerciseRequest.getTopic(),
                exerciseRequest.getDifficulty(),
                baseForm,
                exerciseRequest.getExerciseLanguage(),
                exerciseRequest.isIncludeBaseForm() ? "Include infinitive form or additional context (in parentheses) in the exercises." : "Do not include infinitive form or additional context (in parentheses) in the exercises.",
                exerciseRequest.isIncludeHints() ?
                        "Provide hints with different level of evidence (use 'evidence' field - values from 0 to 100 where 0 is less evident and 100 is completely evident) for each answer. There may be multiple hints for each answer. Make sure hints are in %s language. Make sure to NOT provide final correct answer in the hint".formatted(exerciseRequest.getUserLanguage()) :
                        "Do not provide hints for the answers.",
                exerciseRequest.getUserLanguage(),
                exerciseRequest.getTotal()
        );
        String model = aiServiceProvider.getModel(exerciseRequest.getProvider(), TEXT);
        StructuredChatCompletionCreateParams<ExercisesResponse> createParams = ChatCompletionCreateParams.builder()
                .addUserMessage(prompt)
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
