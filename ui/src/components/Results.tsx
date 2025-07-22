import React from 'react';

interface ResultsProps {
    viewingHistoricalGame: GameRecord | null;
    currentGameData: any;
    score: number;
    totalBlanks: number;
    totalTime: number;
    avgTime: number;
    onStartOver: () => void;
}

export const Results: React.FC<ResultsProps> = ({
    viewingHistoricalGame,
    currentGameData,
    score,
    totalBlanks,
    totalTime,
    avgTime,
    onStartOver
}) => {
    return (
        <div className="results">
            <h2>{viewingHistoricalGame ? 'Historical Game Results' : 'Results'}</h2>

            {/* Main Score and Time Stats */}
            <div className="results-summary">
                <div className="stat-card">
                    <div className="stat-value">{score} / {totalBlanks}</div>
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
                    <p><strong>Date:</strong> {new Date(viewingHistoricalGame.timestamp).toLocaleString()}</p>
                </div>
            )}

            <div className="result-list">
                {currentGameData.exercises?.map((ex: any, exIdx: number) => {
                    // Group answers by position to handle multiple correct answers
                    const allExAnswers = currentGameData.answers?.filter((a: any) => a.exerciseId === ex.exerciseId) || [];
                    const answersByPosition: Record<number, any[]> = {};
                    allExAnswers.forEach((a: any) => {
                        if (!answersByPosition[a.position]) answersByPosition[a.position] = [];
                        answersByPosition[a.position].push(a);
                    });
                    
                    const userAnsArr = currentGameData.userAnswers?.[exIdx] || [];
                    const positions = Object.keys(answersByPosition).map(Number).sort();
                    
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
                                {positions.map((position: number) => {
                                    const userAns = userAnsArr[position] || '';
                                    const possibleAnswers = answersByPosition[position];
                                    const isCorrect = possibleAnswers.some((ans: any) =>
                                        userAns.trim().toLowerCase() === ans.answer.trim().toLowerCase()
                                    );

                                    // Get all unique correct answers and explanations
                                    const correctAnswers = [...new Set(possibleAnswers.map((a: any) => a.answer))];
                                    const explanations = possibleAnswers.filter((a: any) => a.explanation).map((a: any) => a.explanation);
                                    
                                    return (
                                        <div key={position}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                <span style={{
                                                    minWidth: 60,
                                                    fontWeight: 500
                                                }}>Blank {position + 1}:</span>
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
                                                    {isCorrect ?
                                                        (correctAnswers.length > 1 ? 'Correct (all valid: ' : 'Correct') :
                                                        'Correct: '
                                                    }
                                                    {((!isCorrect) || (isCorrect && correctAnswers.length > 1)) && (
                                                        <span style={{
                                                            color: '#fff',
                                                            fontWeight: 500
                                                        }}>
                                                            {correctAnswers.length > 1
                                                                ? correctAnswers.join(' / ')
                                                                : correctAnswers[0]
                                                            }
                                                        </span>
                                                    )}
                                                    {isCorrect && correctAnswers.length > 1 && (
                                                        <span style={{color: '#888'}}>)</span>
                                                    )}
                                                </span>
                                            </div>
                                            {explanations.length > 0 && (
                                                <div style={{marginTop: 8, fontSize: 14, color: '#ffe082'}}>
                                                    {explanations[0]} {/* Show first explanation, could be improved to show all unique ones */}
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
            <button onClick={onStartOver}>
                {viewingHistoricalGame ? 'Back to Form' : 'Start Over'}
            </button>
        </div>
    );
}; 