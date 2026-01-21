import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { updateUser } from '../../redux/slices/userSlice';
import './Settings.css';

export default function Settings() {
    const dispatch = useDispatch();
    const { mode } = useSelector((state) => state.theme);
    const { user } = useSelector((state) => state.user);
    const [musicService, setMusicService] = useState(() =>
        localStorage.getItem('stackpad-music-service') || 'spotify'
    );

    const handleMusicServiceChange = (service) => {
        setMusicService(service);
        localStorage.setItem('stackpad-music-service', service);
    };

    const clearAllData = () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const exportData = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('stackpad')) {
                data[key] = JSON.parse(localStorage.getItem(key));
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stackpad-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2 className="settings-title">
                    <span className="title-icon">⚙️</span>
                    Settings
                </h2>
            </div>

            {/* Appearance */}
            <div className="settings-section glass-card">
                <h3 className="section-title">🎨 Appearance</h3>

                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Theme</span>
                        <span className="setting-desc">Choose light or dark mode</span>
                    </div>
                    <div className="theme-options">
                        <button
                            className={`theme-option ${mode === 'light' ? 'active' : ''}`}
                            onClick={() => mode === 'dark' && dispatch(toggleTheme())}
                        >
                            ☀️ Light
                        </button>
                        <button
                            className={`theme-option ${mode === 'dark' ? 'active' : ''}`}
                            onClick={() => mode === 'light' && dispatch(toggleTheme())}
                        >
                            🌙 Dark
                        </button>
                    </div>
                </div>
            </div>

            {/* Music Preferences */}
            <div className="settings-section glass-card">
                <h3 className="section-title">🎵 Music Preferences</h3>

                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Default Music Service</span>
                        <span className="setting-desc">Choose your preferred music platform</span>
                    </div>
                </div>

                <div className="music-service-options">
                    <button
                        className={`service-option ${musicService === 'spotify' ? 'active' : ''}`}
                        onClick={() => handleMusicServiceChange('spotify')}
                    >
                        <span className="service-icon">🟢</span>
                        <span className="service-name">Spotify</span>
                        <span className="service-desc">Free embeds, full playlists</span>
                    </button>
                    <button
                        className={`service-option ${musicService === 'apple' ? 'active' : ''}`}
                        onClick={() => handleMusicServiceChange('apple')}
                    >
                        <span className="service-icon">🍎</span>
                        <span className="service-name">Apple Music</span>
                        <span className="service-desc">Curated playlists</span>
                    </button>
                    <button
                        className={`service-option ${musicService === 'youtube' ? 'active' : ''}`}
                        onClick={() => handleMusicServiceChange('youtube')}
                    >
                        <span className="service-icon">🔴</span>
                        <span className="service-name">YouTube Music</span>
                        <span className="service-desc">Live streams & videos</span>
                    </button>
                </div>

                <div className="music-links">
                    <p className="links-label">Open in app:</p>
                    <div className="link-buttons">
                        <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="link-btn">
                            🟢 Open Spotify
                        </a>
                        <a href="https://music.apple.com" target="_blank" rel="noopener noreferrer" className="link-btn">
                            🍎 Open Apple Music
                        </a>
                        <a href="https://music.youtube.com" target="_blank" rel="noopener noreferrer" className="link-btn">
                            🔴 Open YouTube Music
                        </a>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="settings-section glass-card">
                <h3 className="section-title">💾 Data Management</h3>

                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Export Data</span>
                        <span className="setting-desc">Download your workspaces, notes, and settings</span>
                    </div>
                    <button className="glass-button" onClick={exportData}>
                        📥 Export
                    </button>
                </div>

                <div className="setting-row danger">
                    <div className="setting-info">
                        <span className="setting-label">Clear All Data</span>
                        <span className="setting-desc">Remove all workspaces and settings</span>
                    </div>
                    <button className="glass-button danger" onClick={clearAllData}>
                        🗑️ Clear All
                    </button>
                </div>
            </div>

            {/* About */}
            <div className="settings-section glass-card">
                <h3 className="section-title">ℹ️ About</h3>
                <div className="about-info">
                    <p><strong>StackPad</strong> - Developer Productivity Dashboard</p>
                    <p className="version">Version 1.0.0</p>
                    <p className="made-with">Made with ❤️ for developers</p>
                </div>
            </div>
        </div>
    );
}
