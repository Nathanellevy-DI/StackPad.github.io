import { createSlice } from '@reduxjs/toolkit';

const getStoredWorkspaces = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('stackpad-workspaces');
        if (stored) return JSON.parse(stored);
    }
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

const saveToStorage = (state) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('stackpad-workspaces', JSON.stringify({
            currentId: state.currentId,
            workspaces: state.workspaces,
        }));
    }
};

const initialState = getStoredWorkspaces();

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        createWorkspace: (state, action) => {
            const newWorkspace = {
                id: Date.now().toString(),
                name: action.payload.name,
                notes: [],
                logs: [],
                createdAt: new Date().toISOString(),
            };
            state.workspaces.push(newWorkspace);
            state.currentId = newWorkspace.id;
            saveToStorage(state);
        },
        switchWorkspace: (state, action) => {
            state.currentId = action.payload;
            saveToStorage(state);
        },
        renameWorkspace: (state, action) => {
            const workspace = state.workspaces.find(w => w.id === action.payload.id);
            if (workspace) {
                workspace.name = action.payload.name;
                saveToStorage(state);
            }
        },
        deleteWorkspace: (state, action) => {
            if (state.workspaces.length > 1) {
                state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
                if (state.currentId === action.payload) {
                    state.currentId = state.workspaces[0].id;
                }
                saveToStorage(state);
            }
        },
        // Notes management
        updateNotes: (state, action) => {
            const workspace = state.workspaces.find(w => w.id === state.currentId);
            if (workspace) {
                workspace.notes = action.payload;
                saveToStorage(state);
            }
        },
        // Logs management
        updateLogs: (state, action) => {
            const workspace = state.workspaces.find(w => w.id === state.currentId);
            if (workspace) {
                workspace.logs = action.payload;
                saveToStorage(state);
            }
        },
    },
});

export const {
    createWorkspace,
    switchWorkspace,
    renameWorkspace,
    deleteWorkspace,
    updateNotes,
    updateLogs,
} = workspaceSlice.actions;

export const selectCurrentWorkspace = (state) =>
    state.workspace.workspaces.find(w => w.id === state.workspace.currentId);

export default workspaceSlice.reducer;
