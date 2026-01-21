import './MobileNav.css';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'todos', label: 'Tasks', icon: '✅' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'progress', label: 'Stats', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
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
