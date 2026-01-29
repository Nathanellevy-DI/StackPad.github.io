/**
 * CommandSearch.jsx - Developer Command Vault
 * 
 * A searchable library of terminal/coding commands.
 * Allows developers to save, organize, and quickly copy often-used commands.
 * 
 * Features:
 * - List view of commands with copy buttons
 * - Search by title, command, tags, or description
 * - Filter by category and favorites
 * - Multi-step commands (e.g., "git add .", "git commit", "git push")
 * - Add/Edit/Delete functionality
 * 
 * Uses 'commandsSlice' in Redux for state management.
 */

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

// Predefined categories with icons for filtering
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

    // Get command data and filter state from Redux
    const { commands, searchQuery, selectedCategory, showFavoritesOnly } = useSelector(
        (state) => state.commands
    );

    // UI state for clipboard feedback
    const [copiedId, setCopiedId] = useState(null);
    const [copiedStep, setCopiedStep] = useState(null);

    // Toggle for the "Add Command" form
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state for new command creation
    const [newCommand, setNewCommand] = useState({
        title: '',
        category: 'custom',
        description: '',
        tags: '',
        steps: [{ command: '', description: '' }], // Starts with one empty step
    });

    /**
     * filteredCommands - Efficiently filters the command list
     * based on search text, category, and favorites only toggle.
     * Memoized to prevent re-calculation on every render.
     */
    const filteredCommands = useMemo(() => {
        return commands.filter((cmd) => {
            // Combine all step commands into one string for easier searching
            const commandText = cmd.steps
                ? cmd.steps.map(s => s.command).join(' ')
                : cmd.command || '';

            // Check if search query matches any field
            const matchesSearch =
                cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                commandText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // Check category filter
            const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;

            // Check favorites filter
            const matchesFavorites = !showFavoritesOnly || cmd.isFavorite;

            return matchesSearch && matchesCategory && matchesFavorites;
        });
    }, [commands, searchQuery, selectedCategory, showFavoritesOnly]);

    /**
     * handleCopy - Copies a single command string to clipboard
     * Shows a temporary success indicator
     */
    const handleCopy = async (command, id, stepIndex = null) => {
        try {
            await navigator.clipboard.writeText(command);
            setCopiedId(id);
            setCopiedStep(stepIndex);
            // Reset "Copied!" state after 2 seconds
            setTimeout(() => {
                setCopiedId(null);
                setCopiedStep(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    /**
     * handleCopyAll - Copies all steps of a multi-step command
     * Joined by newlines
     */
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

    // Form helper: Add a new empty step
    const addStep = () => {
        setNewCommand({
            ...newCommand,
            steps: [...newCommand.steps, { command: '', description: '' }],
        });
    };

    // Form helper: Remove a step (prevents removing the last one)
    const removeStep = (index) => {
        if (newCommand.steps.length > 1) {
            setNewCommand({
                ...newCommand,
                steps: newCommand.steps.filter((_, i) => i !== index),
            });
        }
    };

    // Form helper: Update specific field in a step
    const updateStep = (index, field, value) => {
        const updatedSteps = [...newCommand.steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setNewCommand({ ...newCommand, steps: updatedSteps });
    };

    /**
     * handleAddCommand - Validates and dispatches new command
     */
    const handleAddCommand = (e) => {
        e.preventDefault();
        // Simple validation: must have title and at least one command
        if (!newCommand.title.trim() || !newCommand.steps[0].command.trim()) return;

        // Filter out any empty steps before saving
        const validSteps = newCommand.steps.filter(s => s.command.trim());

        dispatch(addCommand({
            title: newCommand.title,
            category: newCommand.category,
            description: newCommand.description,
            // Process tags string into array
            tags: newCommand.tags.split(',').map(t => t.trim()).filter(Boolean),
            steps: validSteps,
            // Backward compatibility for single-command structure
            command: validSteps.length === 1 ? validSteps[0].command : undefined,
        }));

        // Reset form
        setNewCommand({
            title: '',
            category: 'custom',
            description: '',
            tags: '',
            steps: [{ command: '', description: '' }],
        });
        setShowAddForm(false);
    };

    /**
     * handleDelete - Deletes a command with confirmation
     */
    const handleDelete = (id) => {
        if (confirm('Delete this command?')) {
            dispatch(deleteCommand(id));
        }
    };

    /**
     * getCommandSteps - Normalizes command structure
     * Handles both new multi-step format and old single-string format
     */
    const getCommandSteps = (cmd) => {
        if (cmd.steps && cmd.steps.length > 0) {
            return cmd.steps;
        }
        // Convert old single command format to step array
        return [{ command: cmd.command, description: '' }];
    };

    return (
        <div className="command-search">
            {/* Header section with title and Add button */}
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

            {/* ====== ADD COMMAND FORM ====== */}
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

                    {/* Dynamic Steps Section */}
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

            {/* ====== SEARCH AND FILTER CONTROLS ====== */}
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
                    {/* Clear search button only shown when typing */}
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


            {/* Category tabs removed per user request */}

            {/* Filter results summary */}
            <div className="results-info">
                <span className="results-count">{filteredCommands.length}</span> commands found
            </div>

            {/* ====== RESULTS GRID ====== */}
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

                                {/* Render commands based on step count */}
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
                                        {/* Copy All button for multi-step commands */}
                                        <button
                                            className={`copy-all-btn ${copiedId === cmd.id && copiedStep === 'all' ? 'copied' : ''}`}
                                            onClick={() => handleCopyAll(steps, cmd.id)}
                                        >
                                            {copiedId === cmd.id && copiedStep === 'all' ? '✓ Copied All!' : '📋 Copy All Steps'}
                                        </button>
                                    </div>
                                ) : (
                                    // Single step layout
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
                    // Empty search state
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
