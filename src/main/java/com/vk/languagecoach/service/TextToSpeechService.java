package com.vk.languagecoach.service;

import com.openai.client.OpenAIClient;
import com.openai.core.http.HttpResponse;
import com.openai.models.audio.speech.SpeechCreateParams;
import com.vk.languagecoach.dto.request.tts.TextToSpeechRequest;
import com.vk.languagecoach.dto.request.tts.TextToSpeechTextRequest;
import com.vk.languagecoach.dto.response.tts.TextToSpeechResponse;
import com.vk.languagecoach.dto.response.tts.TextToSpeechTextChunkResponse;
import com.vk.languagecoach.dto.response.tts.TextToSpeechTextResponse;
import com.vk.languagecoach.service.ai.OpenAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class TextToSpeechService {

    private final OpenAIClient openAIClient;
    private final String openAiModel;

    public TextToSpeechService(OpenAIService openAIClient,
                               @Value("${openai.text-to-speech.model}") String openAiModel) {
        this.openAIClient = openAIClient.getClient();
        this.openAiModel = openAiModel;
    }

    public ByteArrayResource textToSpeech(String text, String instructions, double speed) throws IOException {
        log.info("Generating speech for text: {}, instructions: {}, speed: {}", text, instructions, speed);
        SpeechCreateParams build = SpeechCreateParams.builder()
                .body(SpeechCreateParams.Body.builder()
                        .input(text)
                        .model(openAiModel)
                        .voice(SpeechCreateParams.Voice.ALLOY)
                        .build())
                .responseFormat(SpeechCreateParams.ResponseFormat.MP3)
                .instructions(instructions)
                .speed(speed)
                .build();

        try (HttpResponse httpResponse = openAIClient.audio().speech().create(build)) {
            byte[] bytes;
            try (InputStream inputStream = httpResponse.body()) {
                bytes = StreamUtils.copyToByteArray(inputStream);
            }

            log.info("Generated speech for text: {}, instructions: {}, speed: {}", text, instructions, speed);
            return new ByteArrayResource(bytes);
        }
    }

    public TextToSpeechResponse textToSpeech(TextToSpeechRequest textToSpeechRequest) throws IOException {
        log.info("Generating speech for request: {}", textToSpeechRequest);

        List<TextToSpeechTextResponse> textResponses = new ArrayList<>();

        List<TextToSpeechTextRequest> textRequests = textToSpeechRequest.getTexts();
        for (int i = 0; i < textRequests.size(); i++) {
            TextToSpeechTextRequest textRequest = textRequests.get(i);
            List<String> chunkRequests = textRequest.getChunks();
            List<TextToSpeechTextChunkResponse> chunkResponses = processChunks(textToSpeechRequest, chunkRequests, i);
            TextToSpeechTextResponse textResponse = new TextToSpeechTextResponse(chunkResponses);
            textResponses.add(textResponse);
        }


        log.info("Generated response for request: {}", textToSpeechRequest);
        return new TextToSpeechResponse(textResponses);
    }

    private List<TextToSpeechTextChunkResponse> processChunks(TextToSpeechRequest textToSpeechRequest,
                                                              List<String> chunkRequests,
                                                              int textRequestIndex) throws IOException {
        List<TextToSpeechTextChunkResponse> chunkResponses = new ArrayList<>();
        for (int chunkIndex = 0; chunkIndex < chunkRequests.size(); chunkIndex++) {
            String chunk = chunkRequests.get(chunkIndex);
            String name = String.format("%d-%d.mp3", textRequestIndex, chunkIndex);

            ByteArrayResource resource = textToSpeech(chunk, textToSpeechRequest.getInstructions(), textToSpeechRequest.getSpeed());
            chunkResponses.add(new TextToSpeechTextChunkResponse(name, chunk, resource));
        }
        return chunkResponses;
    }
}
