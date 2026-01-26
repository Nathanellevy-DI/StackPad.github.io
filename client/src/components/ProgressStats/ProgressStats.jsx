/**
 * ProgressStats.jsx - Analytics & Gamification Dashboard
 * 
 * Visualizes the user's productivity data from daily check-ins (SystemLogs).
 * Calculates streaks, total hours, and activity breakdown.
 * 
 * Features:
 * - Weekly activity chart (bar chart)
 * - Streak calculation (consecutive days with logs)
 * - Activity breakdown by log type (Progress, Gotcha, Error, Tip)
 * - Share functionality for social media (LinkedIn, Twitter)
 * - Copyable markdown summary for GitHub READMEs
 */

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './ProgressStats.css';

export default function ProgressStats() {
    const workspace = useSelector(selectCurrentWorkspace);
    const logs = workspace?.logs || [];

    // UI state for share modal and copy feedback
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    /**
     * stats - Memoized calculation of all analytics
     * Re-runs only when logs change
     */
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Calculate start of last 7 days
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);

        // Filter logs by date range
        const todayLogs = logs.filter(l => new Date(l.timestamp) >= todayStart);
        const weekLogs = logs.filter(l => new Date(l.timestamp) >= weekStart);

        // Group by log type (progress, gotcha, etc.)
        const byType = logs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        }, {});

        // Calculate total hours spent
        const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);

        // Calculate daily activity for the last 7 days (for bar chart)
        const dailyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(todayStart);
            date.setDate(date.getDate() - i);
            const dayEnd = new Date(date);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const count = logs.filter(l => {
                const d = new Date(l.timestamp);
                return d >= date && d < dayEnd;
            }).length;

            dailyActivity.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count,
            });
        }

        return {
            total: logs.length,
            today: todayLogs.length,
            week: weekLogs.length,
            byType,
            dailyActivity,
            streak: calculateStreak(logs),
            totalHours,
        };
    }, [logs]);

    /**
     * calculateStreak - Counts consecutive days with at least one log
     * Starting from today and going backwards
     */
    function calculateStreak(logs) {
        if (logs.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);

        while (true) {
            const dayEnd = new Date(checkDate);
            dayEnd.setDate(dayEnd.getDate() + 1);

            // Check if any log exists for this specific day
            const hasLog = logs.some(l => {
                const d = new Date(l.timestamp);
                return d >= checkDate && d < dayEnd;
            });

            if (hasLog) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1); // Go back one day
            } else {
                break; // Streak broken
            }
        }

        return streak;
    }

    /**
     * generateShareText - Creates a social media friendly summary
     */
    const generateShareText = () => {
        return `🚀 My Developer Progress on ${workspace?.name || 'StackPad'}!

🔥 ${stats.streak} Day Streak
📊 ${stats.total} Total Check-ins
⏱️ ${stats.totalHours.toFixed(1)} Hours Logged
🚀 ${stats.byType.progress || 0} Progress Updates
💡 ${stats.byType.gotcha || 0} Gotchas Found

#Developer #Productivity #Coding #100DaysOfCode`;
    };

    /**
     * generateMarkdown - Creates a markdown table for GitHub/GitLab
     */
    const generateMarkdown = () => {
        return `## 📊 My Developer Progress

| Metric | Value |
|--------|-------|
| 🔥 Streak | ${stats.streak} days |
| 📊 Total Check-ins | ${stats.total} |
| ⏱️ Hours Logged | ${stats.totalHours.toFixed(1)}h |
| 🚀 Progress Updates | ${stats.byType.progress || 0} |
| 💡 Gotchas | ${stats.byType.gotcha || 0} |
| 🐛 Bugs Fixed | ${stats.byType.error || 0} |
| ✨ Tips Learned | ${stats.byType.tip || 0} |

*Generated with StackPad*`;
    };

    /**
     * copyToClipboard - Copy helper function
     */
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Social sharing helpers
    const shareToLinkedIn = () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`, '_blank');
    };

    const shareToTwitter = () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    // Find max activity count to scale the bar chart
    const maxActivity = Math.max(...stats.dailyActivity.map(d => d.count), 1);

    return (
        <div className="progress-stats">
            {/* Header */}
            <div className="stats-header">
                <div>
                    <h2 className="stats-title">
                        <span className="title-icon">📊</span>
                        Progress Stats
                    </h2>
                    <span className="workspace-label">{workspace?.name}</span>
                </div>
                <button
                    className="glass-button primary share-btn"
                    onClick={() => setShowShareModal(true)}
                >
                    📤 Share Progress
                </button>
            </div>

            {/* ====== STATS CARDS ====== */}
            <div className="stats-cards">
                <div className="stat-card glass-card">
                    <span className="stat-icon">🔥</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.streak}</span>
                        <span className="stat-label">Day Streak</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">📅</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.today}</span>
                        <span className="stat-label">Today's Logs</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">📈</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.week}</span>
                        <span className="stat-label">This Week</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">⏱️</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalHours.toFixed(1)}h</span>
                        <span className="stat-label">Total Hours</span>
                    </div>
                </div>
            </div>

            {/* ====== ACTIVITY CHART ====== */}
            <div className="chart-section glass-card">
                <h3 className="chart-title">Weekly Activity</h3>
                <div className="bar-chart">
                    {stats.dailyActivity.map((day, i) => (
                        <div key={i} className="bar-column">
                            <div className="bar-wrapper">
                                <div
                                    className="bar"
                                    style={{ height: `${(day.count / maxActivity) * 100}%` }}
                                >
                                    {/* Show count on hover/bars */}
                                    <span className="bar-value">{day.count}</span>
                                </div>
                            </div>
                            <span className="bar-label">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ====== BREAKDOWN SECTION ====== */}
            <div className="breakdown-section glass-card">
                <h3 className="chart-title">Log Breakdown</h3>
                <div className="breakdown-grid">
                    <div className="breakdown-item progress">
                        <span className="breakdown-icon">🚀</span>
                        <span className="breakdown-label">Progress</span>
                        <span className="breakdown-value">{stats.byType.progress || 0}</span>
                    </div>
                    <div className="breakdown-item gotcha">
                        <span className="breakdown-icon">💡</span>
                        <span className="breakdown-label">Gotchas</span>
                        <span className="breakdown-value">{stats.byType.gotcha || 0}</span>
                    </div>
                    <div className="breakdown-item error">
                        <span className="breakdown-icon">🐛</span>
                        <span className="breakdown-label">Errors</span>
                        <span className="breakdown-value">{stats.byType.error || 0}</span>
                    </div>
                    <div className="breakdown-item tip">
                        <span className="breakdown-icon">✨</span>
                        <span className="breakdown-label">Tips</span>
                        <span className="breakdown-value">{stats.byType.tip || 0}</span>
                    </div>
                </div>
            </div>

            {/* ====== RECENT ACTIVITY ====== */}
            <div className="recent-section glass-card">
                <h3 className="chart-title">Recent Check-ins</h3>
                <div className="recent-list">
                    {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className="recent-item">
                            <span className="recent-icon">
                                {log.type === 'progress' ? '🚀' : log.type === 'gotcha' ? '💡' : log.type === 'error' ? '🐛' : '✨'}
                            </span>
                            <span className="recent-text">{log.content}</span>
                            <span className="recent-time">
                                {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <p className="no-data">No check-ins yet. Start logging your progress!</p>
                    )}
                </div>
            </div>

            {/* ====== SHARE MODAL ====== */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal glass-card share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📤 Share Your Progress</h3>
                            <button className="modal-close" onClick={() => setShowShareModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="share-buttons">
                                <button className="share-option linkedin" onClick={shareToLinkedIn}>
                                    <span className="share-icon">💼</span>
                                    <span>Share on LinkedIn</span>
                                </button>
                                <button className="share-option twitter" onClick={shareToTwitter}>
                                    <span className="share-icon">🐦</span>
                                    <span>Share on X/Twitter</span>
                                </button>
                            </div>

                            <div className="share-divider">
                                <span>or copy</span>
                            </div>

                            <div className="share-copy-section">
                                <h4>📋 Copy for Social Media</h4>
                                <pre className="share-preview">{generateShareText()}</pre>
                                <button
                                    className={`glass-button ${copied ? 'copied' : 'primary'}`}
                                    onClick={() => copyToClipboard(generateShareText())}
                                >
                                    {copied ? '✓ Copied!' : 'Copy Text'}
                                </button>
                            </div>

                            <div className="share-copy-section">
                                <h4>📝 GitHub README Markdown</h4>
                                <pre className="share-preview markdown">{generateMarkdown()}</pre>
                                <button
                                    className="glass-button primary"
                                    onClick={() => copyToClipboard(generateMarkdown())}
                                >
                                    Copy Markdown
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
