import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
    toggleShowFavorites,
} from '../../redux/slices/commandsSlice';
import './CommandSearch.css';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '📦' },
    { id: 'git', label: 'Git', icon: '🔀' },
    { id: 'docker', label: 'Docker', icon: '🐳' },
    { id: 'npm', label: 'NPM', icon: '📦' },
    { id: 'bash', label: 'Bash', icon: '💻' },
    { id: 'react', label: 'React', icon: '⚛️' },
    { id: 'database', label: 'Database', icon: '🗄️' },
];

export default function CommandSearch() {
    const dispatch = useDispatch();
    const { commands, searchQuery, selectedCategory, showFavoritesOnly } = useSelector(
        (state) => state.commands
    );
    const [copiedId, setCopiedId] = useState(null);

    // Filter commands based on search query, category, and favorites
    const filteredCommands = useMemo(() => {
        return commands.filter((cmd) => {
            const matchesSearch =
                cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
            const matchesFavorites = !showFavoritesOnly || cmd.isFavorite;

            return matchesSearch && matchesCategory && matchesFavorites;
        });
    }, [commands, searchQuery, selectedCategory, showFavoritesOnly]);

    const handleCopy = async (command, id) => {
        try {
            await navigator.clipboard.writeText(command);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="command-search">
            {/* Header */}
            <div className="command-search-header">
                <h2 className="command-search-title">
                    <span className="title-icon">⚡</span>
                    Command Vault
                </h2>
                <p className="command-search-subtitle">Quick access to your developer shortcuts</p>
            </div>

            {/* Search Input */}
            <div className="search-container">
                <div className="search-input-wrapper">
                    <svg
                        className="search-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        className="glass-input search-input"
                        placeholder="Search commands, tags, or descriptions..."
                        value={searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                    {searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => dispatch(setSearchQuery(''))}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Favorites Toggle */}
                <button
                    className={`favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
                    onClick={() => dispatch(toggleShowFavorites())}
                >
                    <span className="star-icon">{showFavoritesOnly ? '★' : '☆'}</span>
                    Favorites
                </button>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => dispatch(setSelectedCategory(cat.id))}
                    >
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-label">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Results Count */}
            <div className="results-info">
                <span className="results-count">{filteredCommands.length}</span> commands found
            </div>

            {/* Command Cards */}
            <div className="command-grid">
                {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd) => (
                        <div key={cmd.id} className="command-card glass-card">
                            <div className="command-card-header">
                                <h3 className="command-title">{cmd.title}</h3>
                                <button
                                    className={`favorite-btn ${cmd.isFavorite ? 'active' : ''}`}
                                    onClick={() => dispatch(toggleFavorite(cmd.id))}
                                >
                                    {cmd.isFavorite ? '★' : '☆'}
                                </button>
                            </div>

                            <p className="command-description">{cmd.description}</p>

                            <div className="command-code-container">
                                <code className="command-code">{cmd.command}</code>
                                <button
                                    className={`copy-btn ${copiedId === cmd.id ? 'copied' : ''}`}
                                    onClick={() => handleCopy(cmd.command, cmd.id)}
                                >
                                    {copiedId === cmd.id ? (
                                        <>
                                            <span className="copy-icon">✓</span>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <span className="copy-icon">📋</span>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="command-tags">
                                {cmd.tags.map((tag, idx) => (
                                    <span key={idx} className="command-tag">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="command-category-badge">
                                {CATEGORIES.find((c) => c.id === cmd.category)?.icon} {cmd.category}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No commands found</h3>
                        <p>Try adjusting your search or category filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}
