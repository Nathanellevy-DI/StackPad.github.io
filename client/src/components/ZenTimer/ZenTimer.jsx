import { useState, useEffect, useRef, useCallback } from 'react';
import './ZenTimer.css';

const TIMER_MODES = {
    work: { label: 'Focus', duration: 25 * 60, color: 'var(--accent-primary)' },
    shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'var(--accent-green)' },
    longBreak: { label: 'Long Break', duration: 15 * 60, color: 'var(--accent-cyan)' },
};

const AMBIENT_SOUNDS = [
    { id: 'none', label: 'None', icon: '🔇' },
    { id: 'rain', label: 'Rain', icon: '🌧️' },
    { id: 'forest', label: 'Forest', icon: '🌲' },
    { id: 'cafe', label: 'Café', icon: '☕' },
    { id: 'waves', label: 'Waves', icon: '🌊' },
];

export default function ZenTimer() {
    const [mode, setMode] = useState('work');
    const [timeLeft, setTimeLeft] = useState(TIMER_MODES.work.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [activeSound, setActiveSound] = useState('none');
    const intervalRef = useRef(null);

    const currentMode = TIMER_MODES[mode];
    const progress = ((currentMode.duration - timeLeft) / currentMode.duration) * 100;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(currentMode.duration);
    }, [currentMode.duration]);

    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_MODES[newMode].duration);
        setIsRunning(false);
    }, []);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if (mode === 'work') {
                setSessions((prev) => prev + 1);
                // Auto-switch to break
                const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                switchMode(nextMode);
            } else {
                switchMode('work');
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, mode, sessions, switchMode]);

    // Calculate stroke dasharray for circular progress
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="zen-timer">
            <div className="timer-header">
                <h2 className="timer-title">
                    <span className="title-icon">🧘</span>
                    Zen Timer & Ambient Player
                </h2>
                <div className="session-count">
                    <span className="session-icon">🎯</span>
                    <span>{sessions} sessions</span>
                </div>
            </div>

            <div className="timer-content">
                {/* Timer Display */}
                <div className="timer-display-container">
                    <div className="timer-circle">
                        <svg className="timer-svg" viewBox="0 0 260 260">
                            {/* Background circle */}
                            <circle
                                className="timer-bg-circle"
                                cx="130"
                                cy="130"
                                r="120"
                                fill="none"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                className="timer-progress-circle"
                                cx="130"
                                cy="130"
                                r="120"
                                fill="none"
                                strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ stroke: currentMode.color }}
                            />
                        </svg>
                        <div className="timer-inner">
                            <span className="timer-time">{formatTime(timeLeft)}</span>
                            <span className="timer-mode-label">{currentMode.label}</span>
                        </div>
                    </div>
                </div>

                {/* Mode Tabs */}
                <div className="mode-tabs">
                    {Object.entries(TIMER_MODES).map(([key, value]) => (
                        <button
                            key={key}
                            className={`mode-tab ${mode === key ? 'active' : ''}`}
                            onClick={() => switchMode(key)}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="timer-controls">
                    {!isRunning ? (
                        <button className="control-btn primary" onClick={startTimer}>
                            <span>▶</span> Start
                        </button>
                    ) : (
                        <button className="control-btn" onClick={pauseTimer}>
                            <span>⏸</span> Pause
                        </button>
                    )}
                    <button className="control-btn" onClick={resetTimer}>
                        <span>↺</span> Reset
                    </button>
                </div>

                {/* Ambient Sounds */}
                <div className="ambient-section">
                    <h3 className="ambient-title">Ambient Sounds</h3>
                    <div className="ambient-grid">
                        {AMBIENT_SOUNDS.map((sound) => (
                            <button
                                key={sound.id}
                                className={`ambient-btn ${activeSound === sound.id ? 'active' : ''}`}
                                onClick={() => setActiveSound(sound.id)}
                            >
                                <span className="ambient-icon">{sound.icon}</span>
                                <span className="ambient-label">{sound.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
