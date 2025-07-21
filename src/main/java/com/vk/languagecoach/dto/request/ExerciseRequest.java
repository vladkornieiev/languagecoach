package com.vk.languagecoach.dto.request;

import com.vk.languagecoach.dto.ExerciseDifficulty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder(toBuilder = true)
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class ExerciseRequest extends BasicAIRequest {
    private String exerciseLanguage;
    private String userLanguage;
    private String topic;
    private int total;
    private ExerciseDifficulty difficulty;
    private boolean includeBaseForm;
    private boolean includeHints;
}
