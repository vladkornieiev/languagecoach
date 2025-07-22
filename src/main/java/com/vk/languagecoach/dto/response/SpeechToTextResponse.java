package com.vk.languagecoach.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class SpeechToTextResponse {
    private String fileName;
    private String text;
    private String language;
}
