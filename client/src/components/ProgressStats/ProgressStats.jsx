import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentWorkspace, updateLogs } from '../../redux/slices/workspaceSlice';
import './ProgressStats.css';

export default function ProgressStats() {
    const workspace = useSelector(selectCurrentWorkspace);
    const logs = workspace?.logs || [];

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);

        const todayLogs = logs.filter(l => new Date(l.timestamp) >= todayStart);
        const weekLogs = logs.filter(l => new Date(l.timestamp) >= weekStart);

        const byType = logs.reduce((acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        }, {});

        // Last 7 days activity
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
        };
    }, [logs]);

    function calculateStreak(logs) {
        if (logs.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);

        while (true) {
            const dayEnd = new Date(checkDate);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const hasLog = logs.some(l => {
                const d = new Date(l.timestamp);
                return d >= checkDate && d < dayEnd;
            });

            if (hasLog) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    const maxActivity = Math.max(...stats.dailyActivity.map(d => d.count), 1);

    return (
        <div className="progress-stats">
            <div className="stats-header">
                <h2 className="stats-title">
                    <span className="title-icon">📊</span>
                    Progress Stats
                </h2>
                <span className="workspace-label">{workspace?.name}</span>
            </div>

            {/* Stats Cards */}
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
                    <span className="stat-icon">📚</span>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Logs</span>
                    </div>
                </div>
            </div>

            {/* Activity Chart */}
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
                                    <span className="bar-value">{day.count}</span>
                                </div>
                            </div>
                            <span className="bar-label">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Log Types Breakdown */}
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

            {/* Recent Activity */}
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
        </div>
    );
}
