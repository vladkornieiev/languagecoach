import React from 'react';
// Use global types from types.d.ts

interface FavoritesSidebarProps {
    isVisible: boolean;
    onClose: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filteredFavorites: TemplateRecord[];
    onLoadFavorite: (favorite: TemplateRecord) => void;
    onDeleteFavorite: (e: React.MouseEvent, id: string) => void;
}

export const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({
    isVisible,
    onClose,
    searchTerm,
    onSearchChange,
    filteredFavorites,
    onLoadFavorite,
    onDeleteFavorite
}) => {
    if (!isVisible) return null;

    return (
        <div className="history-sidebar">
            <div className="sidebar-header">
                <h3>Favorite Templates</h3>
                <button onClick={onClose} className="close-sidebar">×</button>
            </div>
            <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
            />
            <div className="history-list">
                {filteredFavorites.map(fav => (
                    <div key={fav.id} className="history-item" onClick={() => onLoadFavorite(fav)}>
                        <div className="history-item-title">
                            {fav.formData.exerciseLanguage} - {fav.formData.difficulty}
                        </div>
                        <div className="history-item-details">Topic: {fav.formData.topic || 'General'}</div>
                        <div className="history-item-date">{new Date(fav.timestamp).toLocaleDateString()}</div>
                        <div className="history-item-actions">
                            <button className="delete-history-btn"
                                    onClick={(e) => onDeleteFavorite(e, fav.id)}>×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 