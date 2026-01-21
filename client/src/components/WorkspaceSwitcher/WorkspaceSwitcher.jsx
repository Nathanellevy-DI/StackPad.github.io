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
    const { workspaces, currentId } = useSelector((state) => state.workspace);
    const [isOpen, setIsOpen] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');

    const currentWorkspace = workspaces.find(w => w.id === currentId);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        dispatch(createWorkspace({ name: newName.trim() }));
        setNewName('');
        setShowNew(false);
    };

    const handleSwitch = (id) => {
        dispatch(switchWorkspace(id));
        setIsOpen(false);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (workspaces.length > 1 && confirm('Delete this workspace?')) {
            dispatch(deleteWorkspace(id));
        }
    };

    return (
        <div className="workspace-switcher">
            <button
                className="workspace-btn glass-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="workspace-icon">📁</span>
                <span className="workspace-name">{currentWorkspace?.name}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="workspace-dropdown glass-card">
                    <div className="dropdown-header">
                        <span>Workspaces</span>
                        <button
                            className="new-workspace-btn"
                            onClick={() => setShowNew(!showNew)}
                        >
                            {showNew ? '✕' : '+'}
                        </button>
                    </div>

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
                            <button type="submit" className="glass-button primary">
                                Create
                            </button>
                        </form>
                    )}

                    <div className="workspace-list">
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                className={`workspace-item ${ws.id === currentId ? 'active' : ''}`}
                                onClick={() => handleSwitch(ws.id)}
                            >
                                <span className="ws-icon">📁</span>
                                <span className="ws-name">{ws.name}</span>
                                <div className="ws-meta">
                                    <span className="ws-notes">{ws.notes?.length || 0} notes</span>
                                </div>
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
