package com.vk.languagecoach.dto.request.tts;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class TextToSpeechRequest {

    private List<TextToSpeechTextRequest> texts;
    private double speed = 1.0;
    private String instructions;
}
