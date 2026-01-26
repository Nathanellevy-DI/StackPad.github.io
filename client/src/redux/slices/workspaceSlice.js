/**
 * workspaceSlice.js - Workspace State Management
 * 
 * Manages multiple workspaces (projects) in StackPad.
 * Each workspace has its own:
 * - Name
 * - GitHub URL (for the header link)
 * - Notes (sticky notes)
 * - Logs (check-ins)
 * 
 * This allows users to keep different projects separate.
 * All data is persisted to localStorage.
 * 
 * State shape:
 * {
 *   currentId: string,        // ID of the active workspace
 *   workspaces: [
 *     {
 *       id: string,
 *       name: string,
 *       githubUrl: string,    // Project's GitHub repo URL
 *       notes: array,         // Sticky notes for this workspace
 *       logs: array,          // Check-in logs for this workspace
 *       createdAt: string     // ISO date string
 *     }
 *   ]
 * }
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * getStoredWorkspaces - Loads workspaces from localStorage on app start
 * 
 * Returns saved workspaces or creates a default workspace for new users
 */
const getStoredWorkspaces = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('stackpad-workspaces');
        if (stored) return JSON.parse(stored);
    }
    // Default workspace for first-time visitors
    return {
        currentId: 'default',
        workspaces: [
            {
                id: 'default',
                name: 'Default Workspace',
                notes: [],
                logs: [],
                createdAt: new Date().toISOString(),
            }
        ],
    };
};

/**
 * saveToStorage - Persists workspace state to localStorage
 * 
 * Called after every state change to ensure data survives page refreshes
 */
const saveToStorage = (state) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('stackpad-workspaces', JSON.stringify({
            currentId: state.currentId,
            workspaces: state.workspaces,
        }));
    }
};

const initialState = getStoredWorkspaces();

/**
 * Workspace Slice
 * 
 * Actions for managing workspaces:
 * - createWorkspace: Create a new project workspace
 * - switchWorkspace: Change the active workspace
 * - renameWorkspace: Update workspace name
 * - deleteWorkspace: Remove a workspace (keeps at least one)
 * - updateNotes: Save sticky notes for current workspace
 * - updateLogs: Save check-in logs for current workspace
 */
const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        // Create a new workspace and switch to it
        createWorkspace: (state, action) => {
            const newWorkspace = {
                id: Date.now().toString(),  // Simple unique ID using timestamp
                name: action.payload.name,
                githubUrl: action.payload.githubUrl || '',  // Optional GitHub URL
                notes: [],   // Start with empty notes
                logs: [],    // Start with empty logs
                createdAt: new Date().toISOString(),
            };
            state.workspaces.push(newWorkspace);
            state.currentId = newWorkspace.id;  // Auto-switch to new workspace
            saveToStorage(state);
        },

        // Switch to a different workspace by ID
        switchWorkspace: (state, action) => {
            state.currentId = action.payload;
            saveToStorage(state);
        },

        // Rename an existing workspace
        renameWorkspace: (state, action) => {
            const workspace = state.workspaces.find(w => w.id === action.payload.id);
            if (workspace) {
                workspace.name = action.payload.name;
                saveToStorage(state);
            }
        },

        // Delete a workspace (prevents deleting the last one)
        deleteWorkspace: (state, action) => {
            // Must keep at least one workspace
            if (state.workspaces.length > 1) {
                state.workspaces = state.workspaces.filter(w => w.id !== action.payload);

                // If we deleted the current workspace, switch to the first one
                if (state.currentId === action.payload) {
                    state.currentId = state.workspaces[0].id;
                }
                saveToStorage(state);
            }
        },

        // Update sticky notes for the current workspace
        updateNotes: (state, action) => {
            const workspace = state.workspaces.find(w => w.id === state.currentId);
            if (workspace) {
                workspace.notes = action.payload;
                saveToStorage(state);
            }
        },

        // Update check-in logs for the current workspace
        updateLogs: (state, action) => {
            const workspace = state.workspaces.find(w => w.id === state.currentId);
            if (workspace) {
                workspace.logs = action.payload;
                saveToStorage(state);
            }
        },
    },
});

// Export actions for use in components
export const {
    createWorkspace,
    switchWorkspace,
    renameWorkspace,
    deleteWorkspace,
    updateNotes,
    updateLogs,
} = workspaceSlice.actions;

/**
 * Selector: selectCurrentWorkspace
 * 
 * Returns the currently active workspace object.
 * Use this to get the current workspace's data in components:
 *   const workspace = useSelector(selectCurrentWorkspace);
 */
export const selectCurrentWorkspace = (state) =>
    state.workspace.workspaces.find(w => w.id === state.workspace.currentId);

// Export reducer for store configuration
export default workspaceSlice.reducer;
