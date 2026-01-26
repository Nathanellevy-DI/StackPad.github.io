/**
 * WorkspaceSwitcher.jsx - Workspace Dropdown Component
 * 
 * Allows users to switch between different workspaces (projects).
 * Located in the Header next to the logo.
 * 
 * Features:
 * - Dropdown showing all workspaces
 * - Create new workspace with name and GitHub URL
 * - Switch between workspaces
 * - Delete workspaces (minimum 1 required)
 * - Shows note count and GitHub link indicator per workspace
 * 
 * Each workspace has isolated:
 * - Sticky notes
 * - Check-in logs
 * - GitHub repository link
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    createWorkspace,
    switchWorkspace,
    deleteWorkspace,
} from '../../redux/slices/workspaceSlice';
import './WorkspaceSwitcher.css';

export default function WorkspaceSwitcher() {
    const dispatch = useDispatch();

    // Get workspace data from Redux
    const { workspaces, currentId } = useSelector((state) => state.workspace);

    // Local UI state
    const [isOpen, setIsOpen] = useState(false);         // Dropdown visibility
    const [showNew, setShowNew] = useState(false);       // New workspace form visibility
    const [newName, setNewName] = useState('');          // New workspace name input
    const [newGithubUrl, setNewGithubUrl] = useState(''); // New workspace GitHub URL input

    // Find the current workspace object
    const currentWorkspace = workspaces.find(w => w.id === currentId);

    /**
     * handleCreate - Creates a new workspace
     * Requires a name, GitHub URL is optional
     */
    const handleCreate = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;  // Require a name

        dispatch(createWorkspace({
            name: newName.trim(),
            githubUrl: newGithubUrl.trim(),
        }));

        // Reset form and close it
        setNewName('');
        setNewGithubUrl('');
        setShowNew(false);
    };

    /**
     * handleSwitch - Switches to a different workspace
     * Closes the dropdown after switching
     */
    const handleSwitch = (id) => {
        dispatch(switchWorkspace(id));
        setIsOpen(false);
    };

    /**
     * handleDelete - Deletes a workspace with confirmation
     * Prevents deleting the last workspace
     */
    const handleDelete = (e, id) => {
        e.stopPropagation();  // Prevent triggering switch

        // Only allow deletion if more than 1 workspace exists
        if (workspaces.length > 1 && confirm('Delete this workspace?')) {
            dispatch(deleteWorkspace(id));
        }
    };

    return (
        <div className="workspace-switcher">
            {/* Main button showing current workspace */}
            <button
                className="workspace-btn glass-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="workspace-icon">📁</span>
                <span className="workspace-name">{currentWorkspace?.name}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown menu (only shown when open) */}
            {isOpen && (
                <div className="workspace-dropdown glass-card">
                    {/* Dropdown header with "+" button to create new */}
                    <div className="dropdown-header">
                        <span>Workspaces</span>
                        <button
                            className="new-workspace-btn"
                            onClick={() => setShowNew(!showNew)}
                        >
                            {showNew ? '✕' : '+'}
                        </button>
                    </div>

                    {/* New workspace form (shown when "+" clicked) */}
                    {showNew && (
                        <form className="new-workspace-form" onSubmit={handleCreate}>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Workspace name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                            />
                            <input
                                type="url"
                                className="glass-input"
                                placeholder="GitHub repo URL (optional)"
                                value={newGithubUrl}
                                onChange={(e) => setNewGithubUrl(e.target.value)}
                            />
                            <button type="submit" className="glass-button primary">
                                Create
                            </button>
                        </form>
                    )}

                    {/* List of all workspaces */}
                    <div className="workspace-list">
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                className={`workspace-item ${ws.id === currentId ? 'active' : ''}`}
                                onClick={() => handleSwitch(ws.id)}
                            >
                                <span className="ws-icon">📁</span>
                                <span className="ws-name">{ws.name}</span>

                                {/* Metadata: note count and GitHub indicator */}
                                <div className="ws-meta">
                                    <span className="ws-notes">{ws.notes?.length || 0} notes</span>
                                    {/* Show link icon if workspace has GitHub URL */}
                                    {ws.githubUrl && <span className="ws-github">🔗</span>}
                                </div>

                                {/* Delete button (hidden if only 1 workspace) */}
                                {workspaces.length > 1 && (
                                    <button
                                        className="ws-delete"
                                        onClick={(e) => handleDelete(e, ws.id)}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
