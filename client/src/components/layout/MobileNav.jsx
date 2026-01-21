import './MobileNav.css';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'commands', label: 'Commands', icon: '⚡' },
    { id: 'logs', label: 'Check-In', icon: '📋' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'notes', label: 'Notes', icon: '📌' },
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
