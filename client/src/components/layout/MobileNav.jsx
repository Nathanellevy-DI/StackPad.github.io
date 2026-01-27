/**
 * MobileNav.jsx - Mobile Bottom Navigation Bar
 * 
 * Provides navigation on mobile devices (phones/tablets).
 * Fixed to the bottom of the screen like iOS/Android native apps.
 * Hidden on desktop screens (Sidebar is used instead).
 * 
 * Features:
 * - Condensed list of the most important navigation items
 * - Icon + label layout for easy touch targets
 * - Active state highlighting
 * 
 * Note: This shows fewer items than Sidebar because mobile
 * screens have limited space. Users can access other sections
 * from the Settings page or Dashboard.
 * 
 * Props:
 * - activeSection: string - The currently active section ID
 * - onSectionChange: function - Callback to change sections
 */

import './MobileNav.css';

// ============================================
// MOBILE NAVIGATION ITEMS
// Condensed list showing only the most important items
// Keep this list short (5-6 items max) for mobile usability
// ============================================
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },     // Main dashboard
    { id: 'todos', label: 'Tasks', icon: '✅' },        // Task management
    { id: 'music', label: 'Music', icon: '🎵' },        // Music player
    { id: 'progress', label: 'Stats', icon: '📊' },     // Progress stats
    { id: 'slack', label: 'Slack', icon: '💬' },        // Slack Integration
    { id: 'settings', label: 'Settings', icon: '⚙️' },  // App settings
];

export default function MobileNav({ activeSection, onSectionChange }) {
    return (
        <nav className="mobile-nav glass-card">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => onSectionChange(item.id)}
                >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
