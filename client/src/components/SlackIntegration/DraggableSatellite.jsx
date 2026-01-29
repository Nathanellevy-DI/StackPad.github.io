import { useState, useEffect, useRef } from 'react';
import './DraggableSatellite.css';

export default function DraggableSatellite({ onClose, initialContent }) {
    const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [draft, setDraft] = useState(initialContent || '');
    const [isMinimized, setIsMinimized] = useState(false);

    const satelliteRef = useRef(null);

    const handleMouseDown = (e) => {
        if (e.target.closest('.satellite-controls') || e.target.closest('textarea')) return;

        setIsDragging(true);
        const rect = satelliteRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Simple boundary constraints
        const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - 300));
        const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - 50));

        setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            className={`draggable-satellite glass-panel ${isMinimized ? 'minimized' : ''}`}
            ref={satelliteRef}
            style={{ left: position.x, top: position.y }}
            onMouseDown={handleMouseDown}
        >
            <div className="satellite-header">
                <div className="satellite-title">
                    <span className="slack-icon">#</span> Satellite
                </div>
                <div className="satellite-controls">
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? '□' : '_'}
                    </button>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
            </div>

            {!isMinimized && (
                <div className="satellite-content">
                    <textarea
                        className="satellite-input"
                        placeholder="Quick draft..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className="satellite-actions">
                        <button className="satellite-action-btn primary" onClick={() => navigator.clipboard.writeText(draft)}>
                            Copy
                        </button>
                        <button className="satellite-action-btn" onClick={() => window.open('slack://open')}>
                            Open Slack
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
