package com.vk.languagecoach.dto.response.tts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.io.ByteArrayResource;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextToSpeechTextChunkResponse {
    private String name;
    private String text;
    private ByteArrayResource audio;
}
