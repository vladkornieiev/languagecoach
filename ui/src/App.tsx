import React, {useEffect, useState} from 'react';
import './App.css';
import { ExerciseForm } from './components/ExerciseForm';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { HistorySidebar } from './components/HistorySidebar';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { 
    saveGameToHistory, 
    getGameHistory, 
    deleteGameFromHistory,
    getFavorites,
    saveTemplateToFavorites,
    deleteFavorite
} from './utils/storage';

const defaultForm: ExerciseRequest = {
    provider: 'OPENAI',
    exerciseLanguage: 'Spanish',
    userLanguage: 'English',
    topic: 'Past and Future Tenses',
    total: 10,
    difficulty: 'A2',
    includeBaseForm: true,
    includeHints: true,
};

function App() {
    const [step, setStep] = useState<AppStep>('Form');
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
            
            // Transform the new unified response format to the old format
            const exercises: any[] = [];
            const answers: any[] = [];
            const hints: any[] = [];
            
            if (Array.isArray(data)) {
                data.forEach((exercise, index) => {
                    const exerciseId = index;
                    
                    // Add exercise with exerciseId
                    exercises.push({
                        exerciseId,
                        text: exercise.text
                    });
                    
                    // Flatten answers with exerciseId reference
                    if (exercise.answers) {
                        exercise.answers.forEach((answer: any) => {
                            answers.push({
                                exerciseId,
                                position: answer.position,
                                answer: answer.answer,
                                explanation: answer.explanation
                            });
                        });
                    }
                    
                    // Flatten hints with exerciseId reference
                    if (exercise.hints) {
                        exercise.hints.forEach((hint: any) => {
                            hints.push({
                                exerciseId,
                                evidence: hint.evidence,
                                hint: hint.hint
                            });
                        });
                    }
                });
            }
            
            setExercises(exercises);
            setAnswers(answers);
            setHints(hints);
            // Initialize userAnswers: one array per exercise, with N blanks (count ___)
            const blanksPerExercise = exercises.map((ex: any) => {
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
                // Focus handling moved to Quiz component
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
            // Focus handling moved to Quiz component
        } else {
            // Quiz finished, save to history
            const totalTime = timings.reduce((a, b) => a + (b || 0), 0) + (questionStart ? (Date.now() - questionStart) / 1000 : 0);
            const avgTime = timings.length ? totalTime / timings.length : 0;

            // Calculate final score - handle multiple correct answers per position
            const answerMap: Record<number, Record<number, string[]>> = {};
            answers.forEach((a: any) => {
                if (!answerMap[a.exerciseId]) answerMap[a.exerciseId] = {};
                if (!answerMap[a.exerciseId][a.position]) answerMap[a.exerciseId][a.position] = [];
                answerMap[a.exerciseId][a.position].push(a.answer.trim().toLowerCase());
            });
            const score = userAnswers.reduce((acc, ansArr, idx) => {
                const ex = exercises[idx];
                if (!ex) return acc;
                const exAnswers = answerMap[ex.exerciseId] || {};
                let correct = 0;
                ansArr.forEach((ans, pos) => {
                    if (ans && exAnswers[pos] && exAnswers[pos].includes(ans.trim().toLowerCase())) {
                        correct++;
                    }
                });
                return acc + correct;
            }, 0);

            // Calculate total blanks across all exercises
            const totalBlanks = exercises.reduce((total, ex) => {
                const blankCount = (ex.text.match(/___/g) || []).length;
                return total + blankCount;
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
                totalBlanks,
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
        totalBlanks: 0,
    };

    let score = currentGameData.score || 0;
    let totalTime = currentGameData.totalTime || 0;
    let avgTime = currentGameData.avgTime || 0;

    // Calculate total blanks for current or historical game
    const gameExercises = currentGameData.exercises || exercises;
    const totalBlanks = currentGameData.totalBlanks || gameExercises.reduce((total, ex) => {
        const blankCount = (ex.text.match(/___/g) || []).length;
        return total + blankCount;
    }, 0);

    if (!viewingHistoricalGame && step === 'Results' && exercises.length > 0) {
        const answerMap: Record<number, Record<number, string[]>> = {};
        answers.forEach((a: any) => {
            if (!answerMap[a.exerciseId]) answerMap[a.exerciseId] = {};
            if (!answerMap[a.exerciseId][a.position]) answerMap[a.exerciseId][a.position] = [];
            answerMap[a.exerciseId][a.position].push(a.answer.trim().toLowerCase());
        });
        score = userAnswers.reduce((acc, ansArr, idx) => {
            const ex = exercises[idx];
            if (!ex) return acc;
            const exAnswers = answerMap[ex.exerciseId] || {};
            let correct = 0;
            ansArr.forEach((ans, pos) => {
                if (ans && exAnswers[pos] && exAnswers[pos].includes(ans.trim().toLowerCase())) {
                    correct++;
                }
            });
            return acc + correct;
        }, 0);
        totalTime = timings.reduce((a, b) => a + (b || 0), 0);
        avgTime = timings.length ? totalTime / timings.length : 0;
    }



    // Render
    const appWithSidebar = showHistory || showFavorites ? 'with-sidebar' : '';

    return (
        <div className={`App ${appWithSidebar}`}>
            {/* Favorites Toggle */}
            <HistorySidebar
                isVisible={showHistory}
                onClose={() => setShowHistory(false)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filteredHistory={filteredHistory}
                onViewGame={viewHistoricalGame}
                onDeleteGame={handleDeleteHistory}
            />

            <FavoritesSidebar
                isVisible={showFavorites}
                onClose={() => setShowFavorites(false)}
                searchTerm={favoriteSearch}
                onSearchChange={setFavoriteSearch}
                filteredFavorites={filteredFavorites}
                onLoadFavorite={handleLoadFavorite}
                onDeleteFavorite={handleDeleteFavorite}
            />

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
                    <ExerciseForm
                        form={form}
                        loading={loading}
                        error={error}
                        onFormChange={handleFormChange}
                        onFormSubmit={handleFormSubmit}
                        onSaveFavorite={handleSaveFavorite}
                        isSaveDisabled={isSaveDisabled}
                        saveButtonText={saveButtonText}
                    />
                )}

                {step === 'Quiz' && exercises.length > 0 && (
                    <Quiz
                        exercises={exercises}
                        currentIdx={currentIdx}
                        userAnswers={userAnswers}
                        showHints={showHints}
                        hints={hints}
                        form={form}
                        onBlankChange={handleBlankChange}
                        onBlankKeyDown={handleBlankKeyDown}
                        onNext={handleNext}
                        onShowNextHint={handleShowNextHint}
                        getCurrentExerciseHints={getCurrentExerciseHints}
                        getVisibleHints={getVisibleHints}
                    />
                )}

                {step === 'Results' && (
                    <Results
                        viewingHistoricalGame={viewingHistoricalGame}
                        currentGameData={currentGameData}
                        score={score}
                        totalBlanks={totalBlanks}
                        totalTime={totalTime}
                        avgTime={avgTime}
                        onStartOver={() => {
                            setStep('Form');
                            setViewingHistoricalGame(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
