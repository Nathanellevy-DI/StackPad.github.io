/**
 * SystemLogs.jsx - Daily Check-In/Log Component
 * 
 * Allows users to log their daily progress, obstacles, and learnings.
 * Acts as a developer journal to track work history.
 * 
 * Features:
 * - Create new logs with type (Progress, Gotcha, Error, Tip)
 * - Track hours spent per task (optional)
 * - View history of logs
 * - Daily stats header showing hours logged today vs total
 * - Logs are persisted per workspace
 */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentWorkspace, updateLogs } from '../../redux/slices/workspaceSlice';
import './SystemLogs.css';

// Log category definitions
const LOG_TYPES = [
    { id: 'progress', label: 'Progress', icon: '🚀', color: 'var(--accent-green)' },
    { id: 'gotcha', label: 'Gotcha', icon: '💡', color: 'var(--accent-orange)' },
    { id: 'error', label: 'Error', icon: '🐛', color: '#ef4444' },
    { id: 'tip', label: 'Tip', icon: '✨', color: 'var(--accent-cyan)' },
];

export default function SystemLogs() {
    const dispatch = useDispatch();
    const workspace = useSelector(selectCurrentWorkspace);
    const savedLogs = workspace?.logs || [];

    // Local state for logs and UI
    const [logs, setLogs] = useState(savedLogs);
    const [showModal, setShowModal] = useState(false);

    // Form state for new log entry
    const [newLog, setNewLog] = useState({ type: 'progress', content: '', hours: '' });

    // Sync from Redux when workspace changes
    useEffect(() => {
        setLogs(savedLogs);
    }, [workspace?.id]);

    // Save to Redux when logs change (debounced)
    useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(updateLogs(logs));
        }, 500);
        return () => clearTimeout(timeout);
    }, [logs, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newLog.content.trim()) return;

        const log = {
            id: Date.now(),
            type: newLog.type,
            content: newLog.content.trim(),
            hours: parseFloat(newLog.hours) || 0,
            timestamp: new Date().toISOString(),
        };

        setLogs([log, ...logs]); // Add new log to top
        setNewLog({ type: 'progress', content: '', hours: '' }); // Reset form
        setShowModal(false);
    };

    const deleteLog = (id) => {
        setLogs(logs.filter(log => log.id !== id));
    };

    // Helper to format "time ago" string
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    // ============================================
    // STATS CALCULATION
    // ============================================

    // Total hours logged ever
    const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);

    // Logs from today only
    const todayLogs = logs.filter(l => {
        const today = new Date();
        const logDate = new Date(l.timestamp);
        return logDate.toDateString() === today.toDateString();
    });

    // Total hours logged today
    const todayHours = todayLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

    return (
        <div className="system-logs">
            {/* Header */}
            <div className="logs-header">
                <div>
                    <h2 className="logs-title">
                        <span className="title-icon">📋</span>
                        Check-In
                    </h2>
                    <p className="logs-subtitle">Log your daily progress and learnings</p>
                </div>
                <button className="glass-button primary add-checkin-btn" onClick={() => setShowModal(true)}>
                    + Check In
                </button>
            </div>

            {/* ====== STATS OVERVIEW ====== */}
            <div className="stats-row">
                <div className="mini-stat">
                    <span className="mini-stat-icon">📅</span>
                    <div>
                        <span className="mini-stat-value">{todayLogs.length}</span>
                        <span className="mini-stat-label">Today</span>
                    </div>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-icon">⏱️</span>
                    <div>
                        <span className="mini-stat-value">{todayHours.toFixed(1)}h</span>
                        <span className="mini-stat-label">Today's Hours</span>
                    </div>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-icon">📊</span>
                    <div>
                        <span className="mini-stat-value">{logs.length}</span>
                        <span className="mini-stat-label">Total Logs</span>
                    </div>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-icon">🕐</span>
                    <div>
                        <span className="mini-stat-value">{totalHours.toFixed(1)}h</span>
                        <span className="mini-stat-label">Total Hours</span>
                    </div>
                </div>
            </div>

            {/* ====== LOGS LIST ====== */}
            <div className="logs-list">
                {logs.length > 0 ? (
                    logs.map((log) => {
                        const logType = LOG_TYPES.find(t => t.id === log.type) || LOG_TYPES[0];
                        return (
                            <div
                                key={log.id}
                                className="log-entry"
                                style={{ '--log-color': logType.color }}
                            >
                                <div className="log-icon">{logType.icon}</div>
                                <div className="log-content">
                                    <p className="log-text">{log.content}</p>
                                    <div className="log-meta">
                                        <span className="log-time">{formatDate(log.timestamp)}</span>
                                        {log.hours > 0 && <span className="log-hours">{log.hours}h</span>}
                                    </div>
                                </div>
                                <button
                                    className="log-delete"
                                    onClick={() => deleteLog(log.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })
                ) : (
                    // Empty state
                    <div className="no-logs">
                        <span className="no-logs-icon">📝</span>
                        <h3>No check-ins yet</h3>
                        <p>Click "+ Check In" to log your progress!</p>
                    </div>
                )}
            </div>

            {/* ====== NEW CHECK-IN MODAL ====== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>New Check-In</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Type</label>
                                    {/* Type selector buttons */}
                                    <div className="log-type-selector">
                                        {LOG_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                className={`type-btn ${newLog.type === type.id ? 'active' : ''}`}
                                                onClick={() => setNewLog({ ...newLog, type: type.id })}
                                                style={{ '--type-color': type.color }}
                                            >
                                                <span>{type.icon}</span>
                                                <span className="type-label">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>What did you work on?</label>
                                    <textarea
                                        className="glass-input log-textarea"
                                        placeholder="Describe your progress, learnings, or discoveries..."
                                        value={newLog.content}
                                        onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hours spent (optional)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        className="glass-input hours-input"
                                        placeholder="e.g. 2.5"
                                        value={newLog.hours}
                                        onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="glass-button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="glass-button primary">
                                    Save Check-In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
