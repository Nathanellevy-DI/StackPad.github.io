/**
 * ZenTimer.jsx - Pomodoro Timer Component
 * 
 * A focus timer based on the Pomodoro Technique:
 * - Work for 25 minutes, then take a 5-minute break
 * - After 4 work sessions, take a 15-minute long break
 * 
 * Features:
 * - Preset modes: Focus (25min), Short Break (5min), Long Break (15min)
 * - Custom timer duration (1-480 minutes)
 * - Visual circular progress indicator
 * - Session counter
 * - Sound notification when timer completes
 * - Auto-switch to break mode after work session
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import './ZenTimer.css';

// ============================================
// PRESET TIMER MODES
// Each mode has a label, duration (minutes), and accent color
// ============================================
const PRESET_MODES = {
    work: { label: 'Focus', duration: 25, color: 'var(--accent-primary)' },
    shortBreak: { label: 'Short Break', duration: 5, color: 'var(--accent-green)' },
    longBreak: { label: 'Long Break', duration: 15, color: 'var(--accent-cyan)' },
};

export default function ZenTimer() {
    // Current timer mode (work, shortBreak, longBreak)
    const [mode, setMode] = useState('work');

    // Custom timer duration input (in minutes)
    const [customMinutes, setCustomMinutes] = useState(25);

    // Whether we're using a custom duration or a preset
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Time remaining in seconds
    const [timeLeft, setTimeLeft] = useState(25 * 60);

    // Whether the timer is currently running
    const [isRunning, setIsRunning] = useState(false);

    // Count of completed work sessions
    const [sessions, setSessions] = useState(0);

    // Ref to store the interval ID for cleanup
    const intervalRef = useRef(null);

    // Calculate total duration based on current mode
    const currentDuration = isCustomMode ? customMinutes * 60 : PRESET_MODES[mode].duration * 60;

    // Calculate progress percentage for the circular indicator
    const progress = ((currentDuration - timeLeft) / currentDuration) * 100;

    /**
     * formatTime - Converts seconds to MM:SS or H:MM:SS format
     */
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer control functions wrapped in useCallback for stable references
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

    /**
     * switchMode - Changes to a preset timer mode
     * Stops timer and resets to the new duration
     */
    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setIsCustomMode(false);
        setTimeLeft(PRESET_MODES[newMode].duration * 60);
        setIsRunning(false);
    }, []);

    /**
     * applyCustomTime - Applies the custom duration input
     */
    const applyCustomTime = () => {
        setIsCustomMode(true);
        setTimeLeft(customMinutes * 60);
        setIsRunning(false);
    };

    // ============================================
    // TIMER LOGIC (useEffect)
    // Runs every second when timer is active
    // ============================================
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            // Create interval to decrement time every second
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer completed!
            setIsRunning(false);

            // If completing a work session, increment counter and switch to break
            if (mode === 'work' && !isCustomMode) {
                setSessions((prev) => prev + 1);
                // Every 4th session gets a long break, otherwise short break
                const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                switchMode(nextMode);
            }

            // Play notification sound to alert user
            const notif = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            notif.play().catch(console.log);
        }

        // Cleanup: clear interval when component unmounts or dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, mode, sessions, switchMode, isCustomMode]);

    // SVG circle calculations for progress ring
    const circumference = 2 * Math.PI * 120;  // 2πr where r=120
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="zen-timer">
            {/* Header with title and session count */}
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
                {/* ====== CIRCULAR TIMER DISPLAY ====== */}
                <div className="timer-display-container">
                    <div className="timer-circle">
                        {/* SVG for circular progress indicator */}
                        <svg className="timer-svg" viewBox="0 0 260 260">
                            {/* Background circle */}
                            <circle
                                className="timer-bg-circle"
                                cx="130" cy="130" r="120"
                                fill="none" strokeWidth="8"
                            />
                            {/* Progress circle (animated) */}
                            <circle
                                className="timer-progress-circle"
                                cx="130" cy="130" r="120"
                                fill="none" strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ stroke: isCustomMode ? 'var(--accent-orange)' : PRESET_MODES[mode].color }}
                            />
                        </svg>
                        {/* Time and mode label in center */}
                        <div className="timer-inner">
                            <span className="timer-time">{formatTime(timeLeft)}</span>
                            <span className="timer-mode-label">
                                {isCustomMode ? 'Custom Timer' : PRESET_MODES[mode].label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ====== PRESET MODE TABS ====== */}
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

                {/* ====== CUSTOM TIME INPUT ====== */}
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

                {/* ====== TIMER CONTROLS ====== */}
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

                {/* ====== MUSIC HINT ====== */}
                <div className="music-hint-box">
                    <p>🎵 Looking for music? Check out the <strong>Music</strong> tab in the sidebar!</p>
                </div>
            </div>
        </div>
    );
}
