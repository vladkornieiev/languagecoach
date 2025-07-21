package com.vk.languagecoach.service;

import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.StructuredChatCompletionCreateParams;
import com.vk.languagecoach.dto.AIProvider;
import com.vk.languagecoach.dto.request.ExerciseRequest;
import com.vk.languagecoach.dto.response.ExercisesResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ExerciseService {

    private final OpenAIClient openAIClient;
    private final OpenAIClient groqClient;
    private final String groqModel;
    private final String openAiModel;

    public ExerciseService(@Qualifier("openAIClient") OpenAIClient openAIClient,
                           @Qualifier("groqClient") OpenAIClient groqClient,
                           @Value("${groq.text.model}") String groqModel,
                           @Value("${openai.text.model}") String openAiModel) {
        this.openAIClient = openAIClient;
        this.groqClient = groqClient;
        this.groqModel = groqModel;
        this.openAiModel = openAiModel;
    }

    public ExercisesResponse generateExercises(ExerciseRequest exerciseRequest) {
        OpenAIClient client = exerciseRequest.getProvider() == AIProvider.GROQ ? groqClient : openAIClient;
        String model = exerciseRequest.getProvider() == AIProvider.GROQ ? groqModel : openAiModel;

        String baseForm = exerciseRequest.isIncludeBaseForm() ? " (base form)" : "";
        String prompt = """
                I want to practice my %s language skills. Please generate exercises/phrases with empty spaces (___) to fill in.
                Exercises topic is: %s.
                The exercises should be suitable for a %s level learner. Example of the exercise:
                "I like to ___%s in the morning."
                The phrase/sentence may contain multiple blanks (especially for higher difficulty levels). For example:
                "I like to ___%s in the morning and ___%s in the evening."
                Use 'position' to indicate the answer for each blank, starting from zero.
                Make sure that exercises are relevant to the topic and difficulty level and the exercises are in the %s language.
                If there are multiple correct answers, provide them all.
                %s
                %s
                Also, add explanation for each answer in %s language.
                Make sure 'exerciseId' is unique for each exercise, starts from 0, and consistent across exercises/answers/hints.
                Total exercises should be %d.
                """.formatted(
                exerciseRequest.getExerciseLanguage(),
                exerciseRequest.getTopic(),
                exerciseRequest.getDifficulty(),
                baseForm, baseForm, baseForm,
                exerciseRequest.getExerciseLanguage(),
                exerciseRequest.isIncludeBaseForm() ? "Include base form (in parentheses) in the exercises." : "Do not include base form (in parentheses) in the exercises.",
                exerciseRequest.isIncludeHints() ?
                        "Provide hints with different level of evidence (use 'evidence' field - values from 0 to 100 where 0 is less evident and 100 is completely evident) for each answer. There may be multiple hints for each answer." :
                        "Do not provide hints for the answers.",
                exerciseRequest.getUserLanguage(),
                exerciseRequest.getTotal()
        );
        StructuredChatCompletionCreateParams<ExercisesResponse> createParams = ChatCompletionCreateParams.builder()
                .addUserMessage(prompt)
                .responseFormat(ExercisesResponse.class)
                .model(model)
                .build();

        ExercisesResponse exercisesResponse = client
                .chat()
                .completions()
                .create(createParams)
                .choices()
                .getFirst()
                .message()
                .content()
                .orElseThrow(() -> new IllegalStateException("No content in the response"));

        return exercisesResponse;
    }
}
