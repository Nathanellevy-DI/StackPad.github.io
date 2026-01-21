import { useState, useEffect, useRef, useCallback } from 'react';
import './ZenTimer.css';

const PRESET_MODES = {
    work: { label: 'Focus', duration: 25, color: 'var(--accent-primary)' },
    shortBreak: { label: 'Short Break', duration: 5, color: 'var(--accent-green)' },
    longBreak: { label: 'Long Break', duration: 15, color: 'var(--accent-cyan)' },
};

const AMBIENT_SOUNDS = [
    { id: 'none', label: 'None', icon: '🔇', url: null },
    { id: 'rain', label: 'Rain', icon: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3' },
    { id: 'forest', label: 'Forest', icon: '🌲', url: 'https://assets.mixkit.co/active_storage/sfx/217/217-preview.mp3' },
    { id: 'waves', label: 'Waves', icon: '🌊', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
];

// Free lofi YouTube streams (embedded)
const LOFI_STREAMS = [
    { id: 'lofi1', label: 'Lofi Hip Hop', icon: '🎵', videoId: 'jfKfPfyJRdk' },
    { id: 'lofi2', label: 'Chillhop', icon: '🎶', videoId: '5qap5aO4i9A' },
];

export default function ZenTimer() {
    const [mode, setMode] = useState('work');
    const [customMinutes, setCustomMinutes] = useState(25);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [activeSound, setActiveSound] = useState('none');
    const [showLofi, setShowLofi] = useState(false);
    const [selectedLofi, setSelectedLofi] = useState(null);
    const [volume, setVolume] = useState(50);

    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    const currentDuration = isCustomMode ? customMinutes * 60 : PRESET_MODES[mode].duration * 60;
    const progress = ((currentDuration - timeLeft) / currentDuration) * 100;

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
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
        setTimeLeft(currentDuration);
    }, [currentDuration]);

    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setIsCustomMode(false);
        setTimeLeft(PRESET_MODES[newMode].duration * 60);
        setIsRunning(false);
    }, []);

    const applyCustomTime = () => {
        setIsCustomMode(true);
        setTimeLeft(customMinutes * 60);
        setIsRunning(false);
    };

    // Handle ambient sounds
    useEffect(() => {
        if (activeSound === 'none') {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            return;
        }

        const sound = AMBIENT_SOUNDS.find(s => s.id === activeSound);
        if (sound?.url) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(sound.url);
            audioRef.current.loop = true;
            audioRef.current.volume = volume / 100;
            audioRef.current.play().catch(console.log);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [activeSound]);

    // Update volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if (mode === 'work' && !isCustomMode) {
                setSessions((prev) => prev + 1);
                const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                switchMode(nextMode);
            }
            // Play notification sound
            const notif = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            notif.play().catch(console.log);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, mode, sessions, switchMode, isCustomMode]);

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
                            <circle
                                className="timer-bg-circle"
                                cx="130" cy="130" r="120"
                                fill="none" strokeWidth="8"
                            />
                            <circle
                                className="timer-progress-circle"
                                cx="130" cy="130" r="120"
                                fill="none" strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ stroke: isCustomMode ? 'var(--accent-orange)' : PRESET_MODES[mode].color }}
                            />
                        </svg>
                        <div className="timer-inner">
                            <span className="timer-time">{formatTime(timeLeft)}</span>
                            <span className="timer-mode-label">
                                {isCustomMode ? 'Custom Timer' : PRESET_MODES[mode].label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Preset Mode Tabs */}
                <div className="mode-tabs">
                    {Object.entries(PRESET_MODES).map(([key, value]) => (
                        <button
                            key={key}
                            className={`mode-tab ${mode === key && !isCustomMode ? 'active' : ''}`}
                            onClick={() => switchMode(key)}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>

                {/* Custom Time Input */}
                <div className="custom-time-section">
                    <label>Custom Duration:</label>
                    <div className="custom-time-input">
                        <input
                            type="number"
                            min="1"
                            max="480"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                            className="glass-input time-input"
                        />
                        <span className="time-unit">min</span>
                        <button className="glass-button" onClick={applyCustomTime}>
                            Set
                        </button>
                    </div>
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

                    {activeSound !== 'none' && (
                        <div className="volume-control">
                            <span>🔊</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                className="volume-slider"
                            />
                            <span>{volume}%</span>
                        </div>
                    )}
                </div>

                {/* Lofi Music */}
                <div className="lofi-section">
                    <button
                        className="lofi-toggle glass-button"
                        onClick={() => setShowLofi(!showLofi)}
                    >
                        🎵 {showLofi ? 'Hide' : 'Show'} Lofi Player
                    </button>

                    {showLofi && (
                        <div className="lofi-player">
                            <div className="lofi-options">
                                {LOFI_STREAMS.map((stream) => (
                                    <button
                                        key={stream.id}
                                        className={`lofi-btn ${selectedLofi?.id === stream.id ? 'active' : ''}`}
                                        onClick={() => setSelectedLofi(stream)}
                                    >
                                        <span>{stream.icon}</span>
                                        <span>{stream.label}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedLofi && (
                                <div className="lofi-embed">
                                    <iframe
                                        width="100%"
                                        height="80"
                                        src={`https://www.youtube.com/embed/${selectedLofi.videoId}?autoplay=0`}
                                        title={selectedLofi.label}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
