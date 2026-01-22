import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import './Settings.css';

export default function Settings() {
    const dispatch = useDispatch();
    const { mode } = useSelector((state) => state.theme);
    const fileInputRef = useRef(null);
    const [importStatus, setImportStatus] = useState(null);

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
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stackpad-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Validate it's a StackPad backup
                const keys = Object.keys(data);
                const isValidBackup = keys.some(key => key.startsWith('stackpad'));

                if (!isValidBackup) {
                    setImportStatus({ type: 'error', message: 'Invalid backup file' });
                    return;
                }

                // Restore each key to localStorage
                let restoredCount = 0;
                keys.forEach(key => {
                    if (key.startsWith('stackpad')) {
                        const value = typeof data[key] === 'string'
                            ? data[key]
                            : JSON.stringify(data[key]);
                        localStorage.setItem(key, value);
                        restoredCount++;
                    }
                });

                setImportStatus({
                    type: 'success',
                    message: `Restored ${restoredCount} items. Reloading...`
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } catch (err) {
                setImportStatus({ type: 'error', message: 'Failed to parse backup file' });
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        e.target.value = '';
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

                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Import Data</span>
                        <span className="setting-desc">Restore from a backup JSON file</span>
                    </div>
                    <button className="glass-button" onClick={handleImportClick}>
                        📤 Import
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {importStatus && (
                    <div className={`import-status ${importStatus.type}`}>
                        {importStatus.type === 'success' ? '✅' : '❌'} {importStatus.message}
                    </div>
                )}

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
