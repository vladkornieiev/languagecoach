// Use global types from types.d.ts

// Game history functions
export const saveGameToHistory = (gameData: Omit<GameRecord, 'id' | 'timestamp'>) => {
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

export const getGameHistory = (): GameRecord[] => {
    try {
        const history = localStorage.getItem('languageCoachHistory');
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
};

export const deleteGameFromHistory = (id: string) => {
    const history = getGameHistory();
    const updatedHistory = history.filter(game => game.id !== id);
    localStorage.setItem('languageCoachHistory', JSON.stringify(updatedHistory));
    return updatedHistory;
};

// Favorite template functions
export const getFavorites = (): TemplateRecord[] => {
    try {
        const fav = localStorage.getItem('languageCoachFavorites');
        return fav ? JSON.parse(fav) : [];
    } catch {
        return [];
    }
};

export const saveTemplateToFavorites = (formData: ExerciseRequest): TemplateRecord => {
    const favorites = getFavorites();
    const newItem: TemplateRecord = {id: Date.now().toString(), timestamp: Date.now(), formData};
    const updated = [newItem, ...favorites].slice(0, 30); // keep last 30
    localStorage.setItem('languageCoachFavorites', JSON.stringify(updated));
    return newItem;
};

export const deleteFavorite = (id: string): TemplateRecord[] => {
    const favorites = getFavorites();
    const updated = favorites.filter(f => f.id !== id);
    localStorage.setItem('languageCoachFavorites', JSON.stringify(updated));
    return updated;
}; 