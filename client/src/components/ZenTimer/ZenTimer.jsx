import { useState, useEffect, useRef, useCallback } from 'react';
import './ZenTimer.css';

const PRESET_MODES = {
    work: { label: 'Focus', duration: 25, color: 'var(--accent-primary)' },
    shortBreak: { label: 'Short Break', duration: 5, color: 'var(--accent-green)' },
    longBreak: { label: 'Long Break', duration: 15, color: 'var(--accent-cyan)' },
};

// Curated Spotify playlists for focus/work
const SPOTIFY_PLAYLISTS = [
    { id: '0vvXsWCC9xrXsKd4FyS8kM', label: 'Deep Focus', icon: '🧠' },
    { id: '37i9dQZF1DWZeKCadgRdKQ', label: 'Lo-Fi Beats', icon: '🎵' },
    { id: '37i9dQZF1DX5trt9i14X7j', label: 'Coding Mode', icon: '💻' },
    { id: '37i9dQZF1DWWQRwui0ExPn', label: 'Chill Lofi', icon: '☕' },
];

// Apple Music playlists (using embed)
const APPLE_PLAYLISTS = [
    { id: 'pl.9722dd0c7e8b4746b9e2ec5e7b7c7a0a', label: 'Pure Focus', icon: '🎯' },
    { id: 'pl.3f29e145a1ee42b19be6dd6d0bbb0c70', label: 'Lo-Fi Chill', icon: '🌙' },
];

export default function ZenTimer() {
    const [mode, setMode] = useState('work');
    const [customMinutes, setCustomMinutes] = useState(25);
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [showMusic, setShowMusic] = useState(false);
    const [musicService, setMusicService] = useState('spotify');
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    const intervalRef = useRef(null);

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

    const currentPlaylists = musicService === 'spotify' ? SPOTIFY_PLAYLISTS : APPLE_PLAYLISTS;

    return (
        <div className="zen-timer">
            <div className="timer-header">
                <h2 className="timer-title">
                    <span className="title-icon">🧘</span>
                    Zen Timer
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

                {/* Music Integration */}
                <div className="music-section">
                    <button
                        className="music-toggle glass-button"
                        onClick={() => setShowMusic(!showMusic)}
                    >
                        🎵 {showMusic ? 'Hide' : 'Show'} Music Player
                    </button>

                    {showMusic && (
                        <div className="music-player">
                            {/* Service Tabs */}
                            <div className="music-service-tabs">
                                <button
                                    className={`service-tab ${musicService === 'spotify' ? 'active' : ''}`}
                                    onClick={() => { setMusicService('spotify'); setSelectedPlaylist(null); }}
                                >
                                    <span className="service-icon">🟢</span> Spotify
                                </button>
                                <button
                                    className={`service-tab ${musicService === 'apple' ? 'active' : ''}`}
                                    onClick={() => { setMusicService('apple'); setSelectedPlaylist(null); }}
                                >
                                    <span className="service-icon">🍎</span> Apple Music
                                </button>
                            </div>

                            {/* Playlist Options */}
                            <div className="playlist-grid">
                                {currentPlaylists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        className={`playlist-btn ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`}
                                        onClick={() => setSelectedPlaylist(playlist)}
                                    >
                                        <span>{playlist.icon}</span>
                                        <span>{playlist.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Embedded Player */}
                            {selectedPlaylist && (
                                <div className="music-embed">
                                    {musicService === 'spotify' ? (
                                        <iframe
                                            src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.id}?utm_source=generator&theme=0`}
                                            width="100%"
                                            height="152"
                                            frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                            title={selectedPlaylist.label}
                                        />
                                    ) : (
                                        <iframe
                                            src={`https://embed.music.apple.com/us/playlist/${selectedPlaylist.id}`}
                                            width="100%"
                                            height="175"
                                            frameBorder="0"
                                            allow="autoplay *; encrypted-media *; fullscreen *"
                                            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                                            title={selectedPlaylist.label}
                                        />
                                    )}
                                </div>
                            )}

                            {!selectedPlaylist && (
                                <p className="music-hint">Select a playlist above to start playing</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
