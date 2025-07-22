import React from 'react';
// Use global types from types.d.ts

interface HistorySidebarProps {
    isVisible: boolean;
    onClose: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filteredHistory: GameRecord[];
    onViewGame: (game: GameRecord) => void;
    onDeleteGame: (e: React.MouseEvent, id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isVisible,
    onClose,
    searchTerm,
    onSearchChange,
    filteredHistory,
    onViewGame,
    onDeleteGame
}) => {
    if (!isVisible) return null;

    return (
        <div className="history-sidebar">
            <div className="sidebar-header">
                <h3>Game History</h3>
                <button onClick={onClose} className="close-sidebar">×</button>
            </div>
            <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
            />
            <div className="history-list">
                {filteredHistory.map((game) => (
                    <div
                        key={game.id}
                        className="history-item"
                        onClick={() => onViewGame(game)}
                    >
                        <div className="history-item-title">
                            {game.formData.exerciseLanguage} - {game.formData.difficulty}
                        </div>
                        <div className="history-item-details">
                            Topic: {game.formData.topic || 'General'}
                        </div>
                        <div className="history-item-score">
                                                         Score: {game.score}/{game.totalBlanks || game.exercises.reduce((total: number, ex: any) => total + (ex.text.match(/___/g) || []).length, 0)}
                        </div>
                        <div className="history-item-date">
                            {new Date(game.timestamp).toLocaleDateString()}
                        </div>
                        <div className="history-item-actions">
                            <button
                                className="delete-history-btn"
                                onClick={(e) => onDeleteGame(e, game.id)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 