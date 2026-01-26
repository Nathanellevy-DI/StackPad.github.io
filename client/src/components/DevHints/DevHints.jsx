/**
 * DevHints.jsx - Developer Cheat Sheets
 * 
 * A knowledge base of helpful tips, tricks, and keyboard shortcuts.
 * Reads data from a static JSON file (devHintsData.json).
 * 
 * Features:
 * - Searchable list of hints
 * - Filter by category (git, react, css, etc.)
 * - One-click copy for code snippets
 * 
 * Unlike CommandVault, this data is read-only and static,
 * meant for learning and quick reference.
 */

import { useState, useMemo } from 'react';
import hintsData from '../../data/devHintsData.json';
import './DevHints.css';

// Icons for each hint category
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

    // UI state for clipboard feedback
    const [copiedId, setCopiedId] = useState(null);

    // Extract unique categories from the data source
    const categories = useMemo(() => {
        return ['all', ...hintsData.map(cat => cat.category)];
    }, []);

    /**
     * filteredHints - Flattened list of hints matching search/filter
     * 
     * The data comes nested by category:
     * [ { category: 'git', hints: [...] }, ... ]
     * 
     * This function flattens it into a single list of matching hints:
     * [ { title: '...', category: 'git' }, ... ]
     */
    const filteredHints = useMemo(() => {
        let result = [];

        hintsData.forEach(category => {
            // Skip categories that don't match filter
            if (selectedCategory !== 'all' && category.category !== selectedCategory) return;

            category.hints.forEach(hint => {
                // Check if hint matches search query
                const matchesSearch =
                    hint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hint.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hint.description.toLowerCase().includes(searchQuery.toLowerCase());

                if (matchesSearch) {
                    // Add flattened hint object (injecting category name)
                    result.push({ ...hint, category: category.category });
                }
            });
        });

        return result;
    }, [searchQuery, selectedCategory]);

    /**
     * handleCopy - Copies hint text/code to clipboard
     */
    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            // Reset "Copied" feedback after 2 seconds
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="dev-hints">
            {/* Header */}
            <div className="hints-header">
                <h2 className="hints-title">
                    <span className="title-icon">💡</span>
                    DevHints
                </h2>
                <p className="hints-subtitle">Quick reference for developer shortcuts</p>
            </div>

            {/* ====== SEARCH BAR ====== */}
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

            {/* ====== CATEGORY TABS ====== */}
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

            {/* Results summary */}
            <div className="hints-count">
                <span className="count-num">{filteredHints.length}</span> hints found
            </div>

            {/* ====== HINTS GRID ====== */}
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

                            {/* Code snippet with copy button */}
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
                    // Empty state
                    <div className="no-hints">
                        <span className="no-hints-icon">🔍</span>
                        <p>No hints found for "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
