package com.vk.languagecoach.dto.response.tts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextToSpeechResponse {
    private List<TextToSpeechTextResponse> texts;
}
