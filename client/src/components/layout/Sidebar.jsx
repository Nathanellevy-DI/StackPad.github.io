import './Sidebar.css';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'todos', label: 'To-Do', icon: '✅' },
    { id: 'commands', label: 'Commands', icon: '⚡' },
    { id: 'timer', label: 'Zen Timer', icon: '🧘' },
    { id: 'notes', label: 'Notes', icon: '📌' },
    { id: 'logs', label: 'Check-In', icon: '📋' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'hints', label: 'DevHints', icon: '💡' },
];

export default function Sidebar({ activeSection, onSectionChange }) {
    return (
        <aside className="sidebar glass-card">
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

            <div className="sidebar-footer">
                <button className="nav-item settings">
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Settings</span>
                </button>
            </div>
        </aside>
    );
}
