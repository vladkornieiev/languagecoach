package com.vk.languagecoach.dto.request.tts;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class TextToSpeechTextRequest {
    private List<String> chunks;
}
