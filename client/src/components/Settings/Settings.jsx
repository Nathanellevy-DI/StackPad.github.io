/**
 * Settings.jsx - Application Settings Page
 * 
 * Provides user-configurable settings and data management tools.
 * 
 * Sections:
 * 1. Appearance - Theme switching (light/dark mode)
 * 2. Data Management - Export, import, and clear data
 * 3. About - App version and credits
 * 
 * Key features:
 * - Export all data as JSON backup file
 * - Import previously exported backup to restore data
 * - Clear all data with confirmation
 */

import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import './Settings.css';

export default function Settings() {
    const dispatch = useDispatch();
    const { mode } = useSelector((state) => state.theme);

    // Ref to hidden file input for import functionality
    const fileInputRef = useRef(null);

    // Track import status (success/error message)
    const [importStatus, setImportStatus] = useState(null);

    /**
     * clearAllData - Wipes all localStorage data
     * Shows confirmation dialog before proceeding
     */
    const clearAllData = () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();  // Reload to reset app state
        }
    };

    /**
     * exportData - Downloads all StackPad data as JSON
     * 
     * How it works:
     * 1. Collects all localStorage keys starting with 'stackpad'
     * 2. Creates a JSON blob with the data
     * 3. Triggers a download with timestamp in filename
     */
    const exportData = () => {
        const data = {};

        // Iterate through all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Only include StackPad data (not other sites' data)
            if (key.startsWith('stackpad')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    // If not valid JSON, store as string
                    data[key] = localStorage.getItem(key);
                }
            }
        }

        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stackpad-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);  // Cleanup
    };

    /**
     * handleImportClick - Triggers the hidden file input
     */
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * handleFileChange - Processes the selected backup file
     * 
     * Validates it's a StackPad backup, then restores all items
     * to localStorage and reloads the page
     */
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Validate it's a StackPad backup by checking for stackpad keys
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

                // Reload after short delay to show success message
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
            {/* Page Header */}
            <div className="settings-header">
                <h2 className="settings-title">
                    <span className="title-icon">⚙️</span>
                    Settings
                </h2>
            </div>

            {/* ====== APPEARANCE SECTION ====== */}
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

            {/* ====== DATA MANAGEMENT SECTION ====== */}
            <div className="settings-section glass-card">
                <h3 className="section-title">💾 Data Management</h3>

                {/* Export Data */}
                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Export Data</span>
                        <span className="setting-desc">Download your workspaces, notes, and settings</span>
                    </div>
                    <button className="glass-button" onClick={exportData}>
                        📥 Export
                    </button>
                </div>

                {/* Import Data */}
                <div className="setting-row">
                    <div className="setting-info">
                        <span className="setting-label">Import Data</span>
                        <span className="setting-desc">Restore from a backup JSON file</span>
                    </div>
                    <button className="glass-button" onClick={handleImportClick}>
                        📤 Import
                    </button>
                    {/* Hidden file input - triggered by button above */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Import Status Message */}
                {importStatus && (
                    <div className={`import-status ${importStatus.type}`}>
                        {importStatus.type === 'success' ? '✅' : '❌'} {importStatus.message}
                    </div>
                )}

                {/* Clear All Data (Danger Zone) */}
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

            {/* ====== ABOUT SECTION ====== */}
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
