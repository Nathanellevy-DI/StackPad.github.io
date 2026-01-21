import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
    toggleShowFavorites,
    addCommand,
    deleteCommand,
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
    { id: 'custom', label: 'Custom', icon: '✨' },
];

export default function CommandSearch() {
    const dispatch = useDispatch();
    const { commands, searchQuery, selectedCategory, showFavoritesOnly } = useSelector(
        (state) => state.commands
    );
    const [copiedId, setCopiedId] = useState(null);
    const [copiedStep, setCopiedStep] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCommand, setNewCommand] = useState({
        title: '',
        category: 'custom',
        description: '',
        tags: '',
        steps: [{ command: '', description: '' }],
    });

    // Filter commands
    const filteredCommands = useMemo(() => {
        return commands.filter((cmd) => {
            const commandText = cmd.steps
                ? cmd.steps.map(s => s.command).join(' ')
                : cmd.command || '';

            const matchesSearch =
                cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commandText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
            const matchesFavorites = !showFavoritesOnly || cmd.isFavorite;

            return matchesSearch && matchesCategory && matchesFavorites;
        });
    }, [commands, searchQuery, selectedCategory, showFavoritesOnly]);

    const handleCopy = async (command, id, stepIndex = null) => {
        try {
            await navigator.clipboard.writeText(command);
            setCopiedId(id);
            setCopiedStep(stepIndex);
            setTimeout(() => {
                setCopiedId(null);
                setCopiedStep(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCopyAll = async (steps, id) => {
        try {
            const allCommands = steps.map(s => s.command).join('\n');
            await navigator.clipboard.writeText(allCommands);
            setCopiedId(id);
            setCopiedStep('all');
            setTimeout(() => {
                setCopiedId(null);
                setCopiedStep(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const addStep = () => {
        setNewCommand({
            ...newCommand,
            steps: [...newCommand.steps, { command: '', description: '' }],
        });
    };

    const removeStep = (index) => {
        if (newCommand.steps.length > 1) {
            setNewCommand({
                ...newCommand,
                steps: newCommand.steps.filter((_, i) => i !== index),
            });
        }
    };

    const updateStep = (index, field, value) => {
        const updatedSteps = [...newCommand.steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setNewCommand({ ...newCommand, steps: updatedSteps });
    };

    const handleAddCommand = (e) => {
        e.preventDefault();
        if (!newCommand.title.trim() || !newCommand.steps[0].command.trim()) return;

        // Filter out empty steps
        const validSteps = newCommand.steps.filter(s => s.command.trim());

        dispatch(addCommand({
            title: newCommand.title,
            category: newCommand.category,
            description: newCommand.description,
            tags: newCommand.tags.split(',').map(t => t.trim()).filter(Boolean),
            steps: validSteps,
            command: validSteps.length === 1 ? validSteps[0].command : undefined, // Legacy support
        }));

        setNewCommand({
            title: '',
            category: 'custom',
            description: '',
            tags: '',
            steps: [{ command: '', description: '' }],
        });
        setShowAddForm(false);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this command?')) {
            dispatch(deleteCommand(id));
        }
    };

    // Helper to get commands from old format or new format
    const getCommandSteps = (cmd) => {
        if (cmd.steps && cmd.steps.length > 0) {
            return cmd.steps;
        }
        return [{ command: cmd.command, description: '' }];
    };

    return (
        <div className="command-search">
            {/* Header */}
            <div className="command-search-header">
                <div>
                    <h2 className="command-search-title">
                        <span className="title-icon">⚡</span>
                        Command Vault
                    </h2>
                    <p className="command-search-subtitle">Quick access to your developer shortcuts</p>
                </div>
                <button
                    className="glass-button primary add-command-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? '✕ Cancel' : '+ Add Command'}
                </button>
            </div>

            {/* Add Command Form */}
            {showAddForm && (
                <form className="add-command-form glass-card" onSubmit={handleAddCommand}>
                    <div className="form-row">
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Command title..."
                            value={newCommand.title}
                            onChange={(e) => setNewCommand({ ...newCommand, title: e.target.value })}
                            required
                        />
                        <select
                            className="glass-input category-select"
                            value={newCommand.category}
                            onChange={(e) => setNewCommand({ ...newCommand, category: e.target.value })}
                        >
                            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Description..."
                        value={newCommand.description}
                        onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                    />

                    {/* Steps */}
                    <div className="steps-section">
                        <div className="steps-header">
                            <span className="steps-label">Steps ({newCommand.steps.length})</span>
                            <button type="button" className="add-step-btn" onClick={addStep}>
                                + Add Step
                            </button>
                        </div>

                        {newCommand.steps.map((step, index) => (
                            <div key={index} className="step-row">
                                <span className="step-number">{index + 1}</span>
                                <div className="step-inputs">
                                    <input
                                        type="text"
                                        className="glass-input step-command"
                                        placeholder={`Step ${index + 1} command...`}
                                        value={step.command}
                                        onChange={(e) => updateStep(index, 'command', e.target.value)}
                                        required={index === 0}
                                    />
                                    <input
                                        type="text"
                                        className="glass-input step-desc"
                                        placeholder="Step description (optional)"
                                        value={step.description}
                                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                                    />
                                </div>
                                {newCommand.steps.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-step-btn"
                                        onClick={() => removeStep(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Tags (comma separated)"
                        value={newCommand.tags}
                        onChange={(e) => setNewCommand({ ...newCommand, tags: e.target.value })}
                    />
                    <button type="submit" className="glass-button primary">
                        Save Command
                    </button>
                </form>
            )}

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
                    filteredCommands.map((cmd) => {
                        const steps = getCommandSteps(cmd);
                        const isMultiStep = steps.length > 1;

                        return (
                            <div key={cmd.id} className="command-card glass-card">
                                <div className="command-card-header">
                                    <h3 className="command-title">
                                        {cmd.title}
                                        {isMultiStep && <span className="steps-badge">{steps.length} steps</span>}
                                    </h3>
                                    <div className="command-actions">
                                        <button
                                            className={`favorite-btn ${cmd.isFavorite ? 'active' : ''}`}
                                            onClick={() => dispatch(toggleFavorite(cmd.id))}
                                        >
                                            {cmd.isFavorite ? '★' : '☆'}
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(cmd.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <p className="command-description">{cmd.description}</p>

                                {/* Multi-step commands */}
                                {isMultiStep ? (
                                    <div className="command-steps">
                                        {steps.map((step, idx) => (
                                            <div key={idx} className="command-step">
                                                <span className="step-index">{idx + 1}</span>
                                                <div className="step-content">
                                                    {step.description && (
                                                        <span className="step-label">{step.description}</span>
                                                    )}
                                                    <code className="command-code">{step.command}</code>
                                                </div>
                                                <button
                                                    className={`copy-btn small ${copiedId === cmd.id && copiedStep === idx ? 'copied' : ''}`}
                                                    onClick={() => handleCopy(step.command, cmd.id, idx)}
                                                >
                                                    {copiedId === cmd.id && copiedStep === idx ? '✓' : '📋'}
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            className={`copy-all-btn ${copiedId === cmd.id && copiedStep === 'all' ? 'copied' : ''}`}
                                            onClick={() => handleCopyAll(steps, cmd.id)}
                                        >
                                            {copiedId === cmd.id && copiedStep === 'all' ? '✓ Copied All!' : '📋 Copy All Steps'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="command-code-container">
                                        <code className="command-code">{steps[0].command}</code>
                                        <button
                                            className={`copy-btn ${copiedId === cmd.id ? 'copied' : ''}`}
                                            onClick={() => handleCopy(steps[0].command, cmd.id)}
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
                                )}

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
                        );
                    })
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
