import { useState, useMemo } from 'react';
import hintsData from '../../data/devHintsData.json';
import './DevHints.css';

const CATEGORY_ICONS = {
    git: '🔀',
    react: '⚛️',
    css: '🎨',
    javascript: '📜',
    terminal: '💻',
};

export default function DevHints() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [copiedId, setCopiedId] = useState(null);

    const categories = useMemo(() => {
        return ['all', ...hintsData.map(cat => cat.category)];
    }, []);

    const filteredHints = useMemo(() => {
        let result = [];

        hintsData.forEach(category => {
            if (selectedCategory !== 'all' && category.category !== selectedCategory) return;

            category.hints.forEach(hint => {
                const matchesSearch =
                    hint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hint.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hint.description.toLowerCase().includes(searchQuery.toLowerCase());

                if (matchesSearch) {
                    result.push({ ...hint, category: category.category });
                }
            });
        });

        return result;
    }, [searchQuery, selectedCategory]);

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="dev-hints">
            <div className="hints-header">
                <h2 className="hints-title">
                    <span className="title-icon">💡</span>
                    DevHints
                </h2>
                <p className="hints-subtitle">Quick reference for developer shortcuts</p>
            </div>

            {/* Search */}
            <div className="hints-search-container">
                <div className="hints-search-wrapper">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        className="glass-input hints-search"
                        placeholder="Search shortcuts, commands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="hints-categories">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat !== 'all' && <span className="cat-icon">{CATEGORY_ICONS[cat]}</span>}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="hints-count">
                <span className="count-num">{filteredHints.length}</span> hints found
            </div>

            <div className="hints-grid">
                {filteredHints.length > 0 ? (
                    filteredHints.map((hint, idx) => (
                        <div key={idx} className="hint-card glass-card">
                            <div className="hint-card-header">
                                <span className="hint-category-badge">
                                    {CATEGORY_ICONS[hint.category]} {hint.category}
                                </span>
                            </div>
                            <h3 className="hint-title">{hint.title}</h3>
                            <p className="hint-description">{hint.description}</p>
                            <div className="hint-code-container">
                                <code className="hint-code">{hint.shortcut}</code>
                                <button
                                    className={`copy-btn ${copiedId === idx ? 'copied' : ''}`}
                                    onClick={() => handleCopy(hint.shortcut, idx)}
                                >
                                    {copiedId === idx ? '✓ Copied' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-hints">
                        <span className="no-hints-icon">🔍</span>
                        <p>No hints found for "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
