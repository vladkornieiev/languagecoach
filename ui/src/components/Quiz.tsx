import React, { useRef, useEffect } from 'react';

interface QuizProps {
    exercises: any[];
    currentIdx: number;
    userAnswers: string[][];
    showHints: number[];
    hints: any[];
    form: ExerciseRequest;
    onBlankChange: (blankIdx: number, value: string) => void;
    onBlankKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, blankIdx: number, totalBlanks: number) => void;
    onNext: () => void;
    onShowNextHint: () => void;
    getCurrentExerciseHints: () => any[];
    getVisibleHints: () => any[];
}

export const Quiz: React.FC<QuizProps> = ({
    exercises,
    currentIdx,
    userAnswers,
    showHints,
    form,
    onBlankChange,
    onBlankKeyDown,
    onNext,
    onShowNextHint,
    getCurrentExerciseHints,
    getVisibleHints
}) => {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    // Focus first blank on question change
    useEffect(() => {
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 0);
    }, [currentIdx]);

    // Render quiz text with inline blanks
    function renderQuizTextWithInputs(text: string, blanks: string[], onChange: (i: number, v: string) => void, onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, i: number, total: number) => void) {
        const parts = text.split(/(___)/g);
        let blankIdx = 0;
        return parts.map((part, idx) => {
            if (part === '___') {
                const currentBlankIdx = blankIdx;
                blankIdx++;
                return (
                    <input
                        key={idx}
                        ref={el => {
                            inputRefs.current[currentBlankIdx] = el;
                        }}
                        type="text"
                        className="inline-blank"
                        value={blanks[currentBlankIdx] || ''}
                        onChange={e => onChange(currentBlankIdx, e.target.value)}
                        onKeyDown={e => onKeyDown(e, currentBlankIdx, blanks.length)}
                        style={{width: '4em', margin: '0 0.2em', display: 'inline-block', textAlign: 'center'}}
                        autoFocus={currentBlankIdx === 0}
                    />
                );
            }
            return <span key={idx}>{part}</span>;
        });
    }

    if (!exercises[currentIdx]) return null;

    return (
        <div className="quiz">
            <h2>Exercise {currentIdx + 1} of {exercises.length}</h2>
            <div className="exercise-text" style={{marginBottom: 24}}>
                {renderQuizTextWithInputs(
                    exercises[currentIdx].text,
                    userAnswers[currentIdx] || [],
                    onBlankChange,
                    onBlankKeyDown
                )}
            </div>

            {/* Hints Section */}
            {form.includeHints && getCurrentExerciseHints().length > 0 && (
                <div style={{marginTop: 16, width: '100%', maxWidth: 500}}>
                    {getVisibleHints().map((hint: any, idx: number) => (
                        <div key={hint.evidence} className="hint" style={{marginBottom: 8}}>
                            <strong>Hint {idx + 1}:</strong> {hint.hint}
                        </div>
                    ))}
                    {showHints.length < getCurrentExerciseHints().length && (
                        <button
                            type="button"
                            onClick={onShowNextHint}
                            style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                color: '#fbbf24',
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Show Next Hint ({showHints.length + 1}/{getCurrentExerciseHints().length})
                        </button>
                    )}
                </div>
            )}

            <button type="button" onClick={onNext} style={{marginTop: 16}}>
                {currentIdx === exercises.length - 1 ? 'Finish Quiz' : 'Next'}
            </button>
        </div>
    );
}; 