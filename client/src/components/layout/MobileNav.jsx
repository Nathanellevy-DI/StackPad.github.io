import './MobileNav.css';

const NAV_ITEMS = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'commands', icon: '⚡', label: 'Commands' },
    { id: 'timer', icon: '⏱️', label: 'Timer' },
    { id: 'notes', icon: '📝', label: 'Notes' },
    { id: 'logs', icon: '📊', label: 'Logs' },
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
