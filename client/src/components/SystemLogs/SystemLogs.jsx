import { useState } from 'react';
import './SystemLogs.css';

const LOG_TYPES = [
    { id: 'progress', label: 'Progress', icon: '📈', color: 'var(--accent-green)' },
    { id: 'gotcha', label: 'Gotcha', icon: '⚠️', color: 'var(--accent-orange)' },
    { id: 'error', label: 'Error', icon: '🐛', color: 'var(--accent-pink)' },
    { id: 'tip', label: 'Tip', icon: '💡', color: 'var(--accent-cyan)' },
];

const SAMPLE_LOGS = [
    {
        id: 1,
        type: 'progress',
        title: 'Completed API Integration',
        content: 'Successfully integrated the REST API with Redux Toolkit Query. Response caching is now working.',
        timestamp: new Date().toISOString(),
    },
    {
        id: 2,
        type: 'gotcha',
        title: 'PostgreSQL SSL Connection',
        content: 'When connecting to hosted PostgreSQL, make sure to add `?sslmode=require` to the connection string.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 3,
        type: 'error',
        title: 'CORS Issue Fixed',
        content: 'Had to add `credentials: true` to both the Express CORS config and the fetch options.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: 4,
        type: 'tip',
        title: 'Vite HMR Optimization',
        content: 'Split large components into smaller chunks to improve Hot Module Replacement speed.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
];

export default function SystemLogs() {
    const [logs, setLogs] = useState(SAMPLE_LOGS);
    const [newLog, setNewLog] = useState({ type: 'progress', title: '', content: '' });
    const [isFormOpen, setIsFormOpen] = useState(false);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newLog.title.trim() || !newLog.content.trim()) return;

        const log = {
            id: Date.now(),
            ...newLog,
            timestamp: new Date().toISOString(),
        };

        setLogs([log, ...logs]);
        setNewLog({ type: 'progress', title: '', content: '' });
        setIsFormOpen(false);
    };

    const deleteLog = (id) => {
        setLogs(logs.filter(log => log.id !== id));
    };

    return (
        <div className="system-logs">
            <div className="logs-header">
                <h2 className="logs-title">
                    <span className="title-icon">📋</span>
                    Daily Log
                </h2>
                <button
                    className="add-log-btn glass-button primary"
                    onClick={() => setIsFormOpen(!isFormOpen)}
                >
                    {isFormOpen ? '✕ Close' : '+ Add Entry'}
                </button>
            </div>

            {/* Add Log Form */}
            {isFormOpen && (
                <form className="log-form glass-card" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="type-selector">
                            {LOG_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`type-btn ${newLog.type === type.id ? 'active' : ''}`}
                                    onClick={() => setNewLog({ ...newLog, type: type.id })}
                                    style={{ '--type-color': type.color }}
                                >
                                    <span>{type.icon}</span>
                                    <span>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Log title..."
                        value={newLog.title}
                        onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                    />

                    <textarea
                        className="glass-input log-textarea"
                        placeholder="What did you learn or accomplish today?"
                        value={newLog.content}
                        onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                        rows={3}
                    />

                    <button type="submit" className="glass-button primary">
                        Save Entry
                    </button>
                </form>
            )}

            {/* Logs List */}
            <div className="logs-list">
                {logs.map((log) => {
                    const logType = LOG_TYPES.find(t => t.id === log.type) || LOG_TYPES[0];
                    return (
                        <div
                            key={log.id}
                            className="log-entry glass-card"
                            style={{ '--log-color': logType.color }}
                        >
                            <div className="log-entry-header">
                                <div className="log-type-badge">
                                    <span className="log-icon">{logType.icon}</span>
                                    <span className="log-type-label">{logType.label}</span>
                                </div>
                                <div className="log-meta">
                                    <span className="log-time">{formatDate(log.timestamp)}</span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteLog(log.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h3 className="log-entry-title">{log.title}</h3>
                            <p className="log-entry-content">{log.content}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
