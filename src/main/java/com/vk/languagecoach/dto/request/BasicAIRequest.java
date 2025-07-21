package com.vk.languagecoach.dto.request;

import com.vk.languagecoach.dto.AIProvider;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
public class BasicAIRequest {
    private AIProvider provider;
}
