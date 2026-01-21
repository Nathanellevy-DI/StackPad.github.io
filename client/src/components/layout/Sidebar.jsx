import './Sidebar.css';

const NAV_ITEMS = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'commands', icon: '⚡', label: 'Commands' },
    { id: 'timer', icon: '⏱️', label: 'Zen Timer' },
    { id: 'notes', icon: '📝', label: 'Notes' },
    { id: 'logs', icon: '📊', label: 'Logs' },
    { id: 'hints', icon: '💡', label: 'DevHints' },
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
