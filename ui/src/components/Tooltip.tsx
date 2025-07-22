import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
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