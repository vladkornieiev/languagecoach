import React, {useEffect, useRef, useState} from 'react';
import './App.css';

// Tooltip component
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({text, children}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="tooltip-container">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div className="tooltip">
                    {text}
                </div>
            )}
        </div>
    );
};

const defaultForm: ExerciseRequest = {
    provider: 'GROQ',
    exerciseLanguage: 'Spanish',
    userLanguage: 'English',
    topic: 'Past and Future Tenses',
    total: 10,
    difficulty: 'A2',
    includeBaseForm: true,
    includeHints: true,
};

// Game history functions
const saveGameToHistory = (gameData: Omit<GameRecord, 'id' | 'timestamp'>) => {
    const history = getGameHistory();
    const newGame: GameRecord = {
        ...gameData,
        id: Date.now().toString(),
        timestamp: Date.now(),
    };

    const updatedHistory = [newGame, ...history].slice(0, 20); // Keep only last 20
    localStorage.setItem('languageCoachHistory', JSON.stringify(updatedHistory));
    return newGame;
};

const getGameHistory = (): GameRecord[] => {
    try {
        const history = localStorage.getItem('languageCoachHistory');
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
};

const deleteGameFromHistory = (id: string) => {
    const history = getGameHistory();
    const updatedHistory = history.filter(game => game.id !== id);
    localStorage.setItem('languageCoachHistory', JSON.stringify(updatedHistory));
    return updatedHistory;
};

// ---- Types ----
interface TemplateRecord {
    id: string;
    timestamp: number;
    formData: ExerciseRequest;
}

// ---- Favorite utils ----
const getFavorites = (): TemplateRecord[] => {
    try {
        const fav = localStorage.getItem('languageCoachFavorites');
        return fav ? JSON.parse(fav) : [];
    } catch {
        return [];
    }
};

const saveTemplateToFavorites = (formData: ExerciseRequest): TemplateRecord => {
    const favorites = getFavorites();
    const newItem: TemplateRecord = {id: Date.now().toString(), timestamp: Date.now(), formData};
    const updated = [newItem, ...favorites].slice(0, 30); // keep last 30
    localStorage.setItem('languageCoachFavorites', JSON.stringify(updated));
    return newItem;
};

const deleteFavorite = (id: string): TemplateRecord[] => {
    const favorites = getFavorites();
    const updated = favorites.filter(f => f.id !== id);
    localStorage.setItem('languageCoachFavorites', JSON.stringify(updated));
    return updated;
};

function App() {
    const [step, setStep] = useState<'Form' | 'Quiz' | 'Results'>('Form');
    const [form, setForm] = useState<ExerciseRequest>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [hints, setHints] = useState<any[]>([]);

    // Quiz state
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[][]>([]);
    const [timings, setTimings] = useState<number[]>([]);
    const [questionStart, setQuestionStart] = useState<number | null>(null);
    const [showHints, setShowHints] = useState<number[]>([]); // Array of evidence levels shown

    // History state
    const [showHistory, setShowHistory] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingHistoricalGame, setViewingHistoricalGame] = useState<GameRecord | null>(null);

    // Favorites state
    const [showFavorites, setShowFavorites] = useState(false);
    const [favorites, setFavorites] = useState<TemplateRecord[]>([]);
    const [favoriteSearch, setFavoriteSearch] = useState('');
    const [lastSavedForm, setLastSavedForm] = useState<ExerciseRequest | null>(null);

    // Refs for focusing inputs
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    // Load game history on component mount
    useEffect(() => {
        setGameHistory(getGameHistory());
        setFavorites(getFavorites());
    }, []);

    // Check if form has changed from last saved
    const hasFormChanged = lastSavedForm ? JSON.stringify(form) !== JSON.stringify(lastSavedForm) : true;

    // Check if current form already exists in favorites
    const existingFavorite = favorites.find(fav =>
        JSON.stringify(fav.formData) === JSON.stringify(form)
    );

    const saveButtonText = existingFavorite
        ? '★ Already in Favorites'
        : lastSavedForm && !hasFormChanged
            ? '✓ Saved'
            : '⭐ Save to Favorites';

    const isSaveDisabled = !hasFormChanged || !!existingFavorite;

    // Reset quiz state when starting new quiz
    const resetQuizState = () => {
        setCurrentIdx(0);
        setUserAnswers([]);
        setTimings([]);
        setQuestionStart(null);
        setShowHints([]);
        setViewingHistoricalGame(null);
    };

    // Handlers
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        if (type === 'checkbox') {
            setForm((prev) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setExercises([]);
        setAnswers([]);
        setHints([]);
        resetQuizState();
        try {
            const response = await fetch('/api/exercises', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                throw new Error('Failed to generate exercises');
            }
            const data = await response.json();
            setExercises(data.exercises || []);
            setAnswers(data.answers || []);
            setHints(data.hints || []);
            // Initialize userAnswers: one array per exercise, with N blanks (count ___)
            const blanksPerExercise = (data.exercises || []).map((ex: any) => {
                const count = (ex.text.match(/___/g) || []).length;
                return Array.from({length: count}, () => '');
            });
            setUserAnswers(blanksPerExercise);
            setStep('Quiz');
            setQuestionStart(Date.now());
        } catch (err: any) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Quiz logic
    const handleBlankChange = (blankIdx: number, value: string) => {
        setUserAnswers((prev) => {
            const copy = prev.map(arr => [...arr]);
            copy[currentIdx][blankIdx] = value;
            return copy;
        });
    };

    const handleBlankKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, blankIdx: number, totalBlanks: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (blankIdx === totalBlanks - 1) {
                handleNext();
            } else {
                inputRefs.current[blankIdx + 1]?.focus();
            }
        }
    };

    const handleNext = () => {
        if (questionStart !== null) {
            const timeSpent = (Date.now() - questionStart) / 1000;
            setTimings((prev) => {
                const copy = [...prev];
                copy[currentIdx] = timeSpent;
                return copy;
            });
        }
        setShowHints([]);
        if (currentIdx < exercises.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setQuestionStart(Date.now());
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 0);
        } else {
            // Quiz finished, save to history
            const totalTime = timings.reduce((a, b) => a + (b || 0), 0) + (questionStart ? (Date.now() - questionStart) / 1000 : 0);
            const avgTime = timings.length ? totalTime / timings.length : 0;

            // Calculate final score
            const answerMap: Record<number, Record<number, string>> = {};
            answers.forEach((a: any) => {
                if (!answerMap[a.exerciseId]) answerMap[a.exerciseId] = {};
                answerMap[a.exerciseId][a.position] = a.answer.trim().toLowerCase();
            });
            const score = userAnswers.reduce((acc, ansArr, idx) => {
                const ex = exercises[idx];
                if (!ex) return acc;
                const exAnswers = answerMap[ex.exerciseId] || {};
                let correct = 0;
                ansArr.forEach((ans, pos) => {
                    if (ans && exAnswers[pos] && ans.trim().toLowerCase() === exAnswers[pos]) {
                        correct++;
                    }
                });
                return acc + correct;
            }, 0);

            const gameData = {
                formData: form,
                exercises,
                answers,
                hints,
                userAnswers,
                timings: [...timings, questionStart ? (Date.now() - questionStart) / 1000 : 0],
                score,
                totalTime,
                avgTime,
            };
            saveGameToHistory(gameData);
            setGameHistory(getGameHistory());
            setStep('Results');
        }
    };

    // Hint logic - get hints for current exercise sorted by evidence (lowest first)
    const getCurrentExerciseHints = () => {
        if (!exercises[currentIdx]) return [];
        return hints
            .filter((h: any) => h.exerciseId === exercises[currentIdx].exerciseId)
            .sort((a: any, b: any) => a.evidence - b.evidence);
    };

    const handleShowNextHint = () => {
        const exerciseHints = getCurrentExerciseHints();
        const nextHintIndex = showHints.length;
        if (nextHintIndex < exerciseHints.length) {
            setShowHints(prev => [...prev, exerciseHints[nextHintIndex].evidence]);
        }
    };

    const getVisibleHints = () => {
        const exerciseHints = getCurrentExerciseHints();
        return exerciseHints.filter((h: any) => showHints.includes(h.evidence));
    };

    // History functions
    const filteredHistory = gameHistory.filter(game =>
        game.formData.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.formData.exerciseLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.formData.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const viewHistoricalGame = (game: GameRecord) => {
        setViewingHistoricalGame(game);
        setStep('Results');
        setShowHistory(false);
    };

    const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updatedHistory = deleteGameFromHistory(id);
        setGameHistory(updatedHistory);
        if (viewingHistoricalGame?.id === id) {
            setViewingHistoricalGame(null);
            setStep('Form');
        }
    };

    // Favorites functions
    const handleSaveFavorite = () => {
        const newFav = saveTemplateToFavorites(form);
        setFavorites([newFav, ...favorites]);
        setLastSavedForm({...form});
    };

    const handleDeleteFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updated = deleteFavorite(id);
        setFavorites(updated);
    };

    const handleLoadFavorite = (fav: TemplateRecord) => {
        setForm(fav.formData);
        setLastSavedForm({...fav.formData});
        setShowFavorites(false);
    };

    const filteredFavorites = favorites.filter(f =>
        f.formData.topic.toLowerCase().includes(favoriteSearch.toLowerCase()) ||
        f.formData.exerciseLanguage.toLowerCase().includes(favoriteSearch.toLowerCase()) ||
        f.formData.difficulty.toLowerCase().includes(favoriteSearch.toLowerCase())
    );

    // Results logic for current or historical game
    const currentGameData = viewingHistoricalGame || {
        exercises,
        answers,
        userAnswers,
        timings,
        score: 0,
        totalTime: 0,
        avgTime: 0,
    };

    let score = currentGameData.score || 0;
    let totalTime = currentGameData.totalTime || 0;
    let avgTime = currentGameData.avgTime || 0;

    if (!viewingHistoricalGame && step === 'Results' && exercises.length > 0) {
        const answerMap: Record<number, Record<number, string>> = {};
        answers.forEach((a: any) => {
            if (!answerMap[a.exerciseId]) answerMap[a.exerciseId] = {};
            answerMap[a.exerciseId][a.position] = a.answer.trim().toLowerCase();
        });
        score = userAnswers.reduce((acc, ansArr, idx) => {
            const ex = exercises[idx];
            if (!ex) return acc;
            const exAnswers = answerMap[ex.exerciseId] || {};
            let correct = 0;
            ansArr.forEach((ans, pos) => {
                if (ans && exAnswers[pos] && ans.trim().toLowerCase() === exAnswers[pos]) {
                    correct++;
                }
            });
            return acc + correct;
        }, 0);
        totalTime = timings.reduce((a, b) => a + (b || 0), 0);
        avgTime = timings.length ? totalTime / timings.length : 0;
    }

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

    // Focus first blank on question change
    useEffect(() => {
        if (step === 'Quiz') {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 0);
        }
    }, [step, currentIdx]);

    // Render
    const appWithSidebar = showHistory || showFavorites ? 'with-sidebar' : '';

    return (
        <div className={`App ${appWithSidebar}`}>
            {/* Favorites Toggle */}
            {/* History Sidebar */}
            {showHistory && (
                <div className="history-sidebar">
                    <div className="sidebar-header">
                        <h3>Game History</h3>
                        <button onClick={() => setShowHistory(false)} className="close-sidebar">×</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="history-list">
                        {filteredHistory.map((game) => (
                            <div
                                key={game.id}
                                className="history-item"
                                onClick={() => viewHistoricalGame(game)}
                            >
                                <div className="history-item-title">
                                    {game.formData.exerciseLanguage} - {game.formData.difficulty}
                                </div>
                                <div className="history-item-details">
                                    Topic: {game.formData.topic || 'General'}
                                </div>
                                <div className="history-item-score">
                                    Score: {game.score}/{game.answers.length}
                                </div>
                                <div className="history-item-date">
                                    {new Date(game.timestamp).toLocaleDateString()}
                                </div>
                                <div className="history-item-actions">
                                    <button
                                        className="delete-history-btn"
                                        onClick={(e) => handleDeleteHistory(e, game.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Favorites Sidebar */}
            {showFavorites && (
                <div className="history-sidebar">
                    <div className="sidebar-header">
                        <h3>Favorite Templates</h3>
                        <button onClick={() => setShowFavorites(false)} className="close-sidebar">×</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search favorites..."
                        value={favoriteSearch}
                        onChange={(e) => setFavoriteSearch(e.target.value)}
                        className="search-input"
                    />
                    <div className="history-list">
                        {filteredFavorites.map(fav => (
                            <div key={fav.id} className="history-item" onClick={() => handleLoadFavorite(fav)}>
                                <div className="history-item-title">
                                    {fav.formData.exerciseLanguage} - {fav.formData.difficulty}
                                </div>
                                <div className="history-item-details">Topic: {fav.formData.topic || 'General'}</div>
                                <div className="history-item-date">{new Date(fav.timestamp).toLocaleDateString()}</div>
                                <div className="history-item-actions">
                                    <button className="delete-history-btn"
                                            onClick={(e) => handleDeleteFavorite(e, fav.id)}>×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="main-content">
                {/* Toggle buttons */}
                <div className="toggle-buttons">
                    <button
                        className={`history-toggle ${showHistory ? 'active' : ''}`}
                        onClick={() => {
                            setShowHistory(!showHistory);
                            setShowFavorites(false);
                        }}
                    >
                        📚 History
                    </button>
                    <button
                        className={`history-toggle favorite-toggle ${showFavorites ? 'active' : ''}`}
                        onClick={() => {
                            setShowFavorites(!showFavorites);
                            setShowHistory(false);
                        }}
                    >
                        ⭐ Favorites
                    </button>
                </div>

                <h1>Language Coach</h1>

                {step === 'Form' && (
                    <form className="exercise-form card" onSubmit={handleFormSubmit}>
                        <div className="form-section">
                            <label>
                                <div className="label-with-tooltip">
                                    Provider:
                                    <Tooltip
                                        text="Choose the AI provider to generate exercises. GROQ is faster, OpenAI may provide more varied content.">
                                        <span className="tooltip-trigger">?</span>
                                    </Tooltip>
                                </div>
                                <select name="provider" value={form.provider} onChange={handleFormChange}>
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
                                <input name="exerciseLanguage" value={form.exerciseLanguage} onChange={handleFormChange}
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
                                <input name="userLanguage" value={form.userLanguage} onChange={handleFormChange}
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
                                <input name="topic" value={form.topic} onChange={handleFormChange}
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
                                       onChange={handleFormChange} required/>
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
                                <select name="difficulty" value={form.difficulty} onChange={handleFormChange}>
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
                                           onChange={handleFormChange}/>
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
                                           onChange={handleFormChange}/>
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
                                onClick={handleSaveFavorite}
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
                )}

                {step === 'Quiz' && exercises.length > 0 && (
                    <div className="quiz">
                        <h2>Exercise {currentIdx + 1} of {exercises.length}</h2>
                        <div className="exercise-text" style={{marginBottom: 24}}>
                            {renderQuizTextWithInputs(
                                exercises[currentIdx].text,
                                userAnswers[currentIdx] || [],
                                handleBlankChange,
                                handleBlankKeyDown
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
                                        onClick={handleShowNextHint}
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

                        <button type="button" onClick={handleNext} style={{marginTop: 16}}>
                            {currentIdx === exercises.length - 1 ? 'Finish Quiz' : 'Next'}
                        </button>
                    </div>
                )}

                {/* Results section stays the same */}
                {step === 'Results' && (
                    <div className="results">
                        <h2>{viewingHistoricalGame ? 'Historical Game Results' : 'Results'}</h2>

                        {/* Main Score and Time Stats */}
                        <div className="results-summary">
                            <div className="stat-card">
                                <div className="stat-value">{score} / {currentGameData.answers?.length || 0}</div>
                                <div className="stat-label">Score</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{totalTime.toFixed(1)}s</div>
                                <div className="stat-label">Total Time</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{avgTime.toFixed(1)}s</div>
                                <div className="stat-label">Avg per Question</div>
                            </div>
                        </div>

                        {viewingHistoricalGame && (
                            <div className="game-info">
                                <p><strong>Language:</strong> {viewingHistoricalGame.formData.exerciseLanguage}</p>
                                <p><strong>Difficulty:</strong> {viewingHistoricalGame.formData.difficulty}</p>
                                <p><strong>Topic:</strong> {viewingHistoricalGame.formData.topic || 'General'}</p>
                                <p><strong>Date:</strong> {new Date(viewingHistoricalGame.timestamp).toLocaleString()}
                                </p>
                            </div>
                        )}

                        <div className="result-list">
                            {currentGameData.exercises?.map((ex: any, exIdx: number) => {
                                const exAnswers = currentGameData.answers?.filter((a: any) => a.exerciseId === ex.exerciseId).sort((a: any, b: any) => a.position - b.position) || [];
                                const userAnsArr = currentGameData.userAnswers?.[exIdx] || [];
                                return (
                                    <div key={ex.exerciseId} className="result-exercise" style={{
                                        marginBottom: 16,
                                        padding: 16,
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        borderRadius: 12,
                                        border: '1px solid rgba(148, 163, 184, 0.2)'
                                    }}>
                                        <div style={{
                                            marginBottom: 12,
                                            fontWeight: 600,
                                            fontSize: '1.05rem',
                                            color: '#f1f5f9'
                                        }}>{ex.text}</div>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                            {exAnswers.map((ans: any, posIdx: number) => {
                                                const userAns = userAnsArr[posIdx] || '';
                                                const isCorrect = userAns.trim().toLowerCase() === ans.answer.trim().toLowerCase();
                                                return (
                                                    <div key={posIdx}>
                                                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                            <span style={{
                                                                minWidth: 60,
                                                                fontWeight: 500
                                                            }}>Blank {posIdx + 1}:</span>
                                                            <span style={{
                                                                color: isCorrect ? '#4caf50' : '#f44336',
                                                                fontWeight: 600,
                                                                borderBottom: '1.5px solid',
                                                                borderColor: isCorrect ? '#4caf50' : '#f44336',
                                                                background: '#181818',
                                                                padding: '2px 8px',
                                                                borderRadius: 6,
                                                                minWidth: 60,
                                                                display: 'inline-block',
                                                            }}>{userAns ||
                                                                <span style={{color: '#888'}}>No answer</span>}</span>
                                                            <span style={{color: '#888', fontSize: 13}}>
                                {isCorrect ? 'Correct' : 'Correct: '}
                                                                {!isCorrect && (
                                                                    <span style={{
                                                                        color: '#fff',
                                                                        fontWeight: 500
                                                                    }}>{ans.answer}</span>
                                                                )}
                              </span>
                                                        </div>
                                                        {ans.explanation && (
                                                            <div style={{marginTop: 8, fontSize: 14, color: '#ffe082'}}>
                                                                {ans.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => {
                            setStep('Form');
                            setViewingHistoricalGame(null);
                        }}>
                            {viewingHistoricalGame ? 'Back to Form' : 'Start Over'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
