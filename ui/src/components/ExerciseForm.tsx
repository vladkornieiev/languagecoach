import React from 'react';
import { Tooltip } from './Tooltip';
// Use global types from types.d.ts

interface ExerciseFormProps {
    form: ExerciseRequest;
    loading: boolean;
    error: string | null;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onFormSubmit: (e: React.FormEvent) => void;
    onSaveFavorite: () => void;
    isSaveDisabled: boolean;
    saveButtonText: string;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
    form,
    loading,
    error,
    onFormChange,
    onFormSubmit,
    onSaveFavorite,
    isSaveDisabled,
    saveButtonText
}) => {
    return (
        <form className="exercise-form card" onSubmit={onFormSubmit}>
            <div className="form-section">
                <label>
                    <div className="label-with-tooltip">
                        Provider:
                        <Tooltip
                            text="Choose the AI provider to generate exercises. GROQ is faster, OpenAI may provide more varied content.">
                            <span className="tooltip-trigger">?</span>
                        </Tooltip>
                    </div>
                    <select name="provider" value={form.provider} onChange={onFormChange}>
                        <option value="GROQ">GROQ</option>
                        <option value="OPENAI">OPENAI</option>
                    </select>
                </label>
            </div>

            <div className="form-section">
                <label>
                    <div className="label-with-tooltip">
                        Exercise Language:
                        <Tooltip text="The language you want to practice (e.g., Spanish, French, German).">
                            <span className="tooltip-trigger">?</span>
                        </Tooltip>
                    </div>
                    <input name="exerciseLanguage" value={form.exerciseLanguage} onChange={onFormChange}
                           required/>
                </label>
            </div>

            <div className="form-section">
                <label>
                    <div className="label-with-tooltip">
                        User Language:
                        <Tooltip
                            text="Your native language or the language for explanations and hints (e.g., English, Portuguese).">
                            <span className="tooltip-trigger">?</span>
                        </Tooltip>
                    </div>
                    <input name="userLanguage" value={form.userLanguage} onChange={onFormChange}
                           required/>
                </label>
            </div>

            <div className="form-section">
                <label>
                    <div className="label-with-tooltip">
                        Topic:
                        <Tooltip
                            text="Specific topic or theme for exercises (e.g., 'travel', 'food', 'business'). Leave empty for general exercises.">
                            <span className="tooltip-trigger">?</span>
                        </Tooltip>
                    </div>
                    <input name="topic" value={form.topic} onChange={onFormChange}
                           placeholder="Optional"/>
                </label>
            </div>

            <div className="form-section">
                <label>
                    <div className="label-with-tooltip">
                        Total Exercises:
                        <Tooltip text="Number of fill-in-the-blank exercises to generate (1-50).">
                            <span className="tooltip-trigger">?</span>
                        </Tooltip>
                    </div>
                    <input name="total" type="number" min={1} max={50} value={form.total}
                           onChange={onFormChange} required/>
                </label>
            </div>

            <div className="form-section">
                <label>
                    <div className="label-with-tooltip">
                        Difficulty:
                        <Tooltip
                            text="Language proficiency level based on CEFR standards. A1 is beginner, C2 is near-native proficiency.">
                            <span className="tooltip-trigger">?</span>
                        </Tooltip>
                    </div>
                    <select name="difficulty" value={form.difficulty} onChange={onFormChange}>
                        <option value="A1">A1 - Beginner</option>
                        <option value="A2">A2 - Elementary</option>
                        <option value="B1">B1 - Intermediate</option>
                        <option value="B2">B2 - Upper Intermediate</option>
                        <option value="C1">C1 - Advanced</option>
                        <option value="C2">C2 - Proficiency</option>
                    </select>
                </label>
            </div>

            <div className="form-section">
                <div className="form-section-title">
                    Options
                    <Tooltip text="Additional features to enhance your learning experience.">
                        <span className="tooltip-trigger">?</span>
                    </Tooltip>
                </div>
                <div className="checkbox-row">
                    <label className="checkbox-item">
                        <input name="includeBaseForm" type="checkbox" checked={form.includeBaseForm}
                               onChange={onFormChange}/>
                        <div className="checkbox-label-with-tooltip">
                            Include Base Form
                            <Tooltip
                                text="Show the infinitive or base form of verbs in exercises (helpful for learning verb conjugations).">
                                <span className="tooltip-trigger">?</span>
                            </Tooltip>
                        </div>
                    </label>
                    <label className="checkbox-item">
                        <input name="includeHints" type="checkbox" checked={form.includeHints}
                               onChange={onFormChange}/>
                        <div className="checkbox-label-with-tooltip">
                            Include Hints
                            <Tooltip
                                text="Provide progressive hints during exercises to help you when you're stuck.">
                                <span className="tooltip-trigger">?</span>
                            </Tooltip>
                        </div>
                    </label>
                </div>
            </div>

            <div className="button-row">
                <button
                    type="button"
                    onClick={onSaveFavorite}
                    disabled={isSaveDisabled}
                    className={isSaveDisabled ? 'saved-button' : 'save-button'}
                >
                    {saveButtonText}
                </button>
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Exercises'}
                </button>
            </div>
            {loading &&
                <div style={{color: '#667eea', textAlign: 'center', marginTop: '1rem'}}>Creating your
                    personalized exercises...</div>}
            {error && <div style={{color: '#f44336', textAlign: 'center', marginTop: '1rem'}}>{error}</div>}
        </form>
    );
}; 