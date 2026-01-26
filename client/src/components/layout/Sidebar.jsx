/**
 * Sidebar.jsx - Desktop Navigation Sidebar
 * 
 * The sidebar provides navigation on desktop screens.
 * It's hidden on mobile (MobileNav is used instead).
 * 
 * Features:
 * - List of navigation items with icons
 * - Active state highlighting
 * - Settings button at the bottom
 * 
 * Props:
 * - activeSection: string - The currently active section ID
 * - onSectionChange: function - Callback to change sections
 */

import './Sidebar.css';

// ============================================
// NAVIGATION ITEMS
// Each item has an ID (used for routing), label, and emoji icon
// The ID must match the case values in App.jsx's renderContent()
// ============================================
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },  // Main overview page
    { id: 'todos', label: 'To-Do', icon: '✅' },          // Task management
    { id: 'timer', label: 'Zen Timer', icon: '🧘' },      // Pomodoro timer
    { id: 'music', label: 'Music', icon: '🎵' },          // YouTube music player
    { id: 'notes', label: 'Notes', icon: '📌' },          // Sticky notes
    { id: 'logs', label: 'Check-In', icon: '📋' },        // Daily check-ins
    { id: 'progress', label: 'Progress', icon: '📊' },    // Stats and streaks
    { id: 'commands', label: 'Commands', icon: '⚡' },    // Command vault
    { id: 'hints', label: 'DevHints', icon: '💡' },       // Developer cheat sheets
];

export default function Sidebar({ activeSection, onSectionChange }) {
    return (
        <aside className="sidebar glass-card">
            {/* Main navigation list */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Settings button at the bottom of the sidebar */}
            <div className="sidebar-footer">
                <button
                    className={`nav-item settings ${activeSection === 'settings' ? 'active' : ''}`}
                    onClick={() => onSectionChange('settings')}
                >
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Settings</span>
                </button>
            </div>
        </aside>
    );
}
