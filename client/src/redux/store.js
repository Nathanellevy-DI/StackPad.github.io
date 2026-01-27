/**
 * store.js - Redux Store Configuration
 * 
 * This file creates the central Redux store that holds all application state.
 * Redux is a state management library that provides a single source of truth
 * for data that needs to be shared across components.
 * 
 * How Redux works:
 * 1. Store: Single object holding all app state
 * 2. Slices: Separate pieces of state (theme, user, workspace, etc.)
 * 3. Reducers: Functions that update state based on actions
 * 4. Actions: Objects that describe what happened
 * 
 * To access state in components:
 *   const { mode } = useSelector((state) => state.theme);
 * 
 * To update state in components:
 *   const dispatch = useDispatch();
 *   dispatch(toggleTheme());
 */

import { configureStore } from '@reduxjs/toolkit';

// Import all slice reducers
import themeReducer from './slices/themeSlice';         // Light/dark mode
import commandsReducer from './slices/commandsSlice';   // Command vault data
import userReducer from './slices/userSlice';           // User profile info
import workspaceReducer from './slices/workspaceSlice'; // Workspace management
import musicReducer from './slices/musicSlice';         // Music player state

/**
 * Configure and create the Redux store
 * 
 * The 'reducer' object maps state keys to their reducers:
 * - state.theme    → themeReducer
 * - state.commands → commandsReducer
 * - state.user     → userReducer
 * - state.workspace → workspaceReducer
 * - state.music    → musicReducer
 */
/**
 * persistenceMiddleware - Centralized Auto-Save
 * 
 * Automatically saves specific slices of state to localStorage
 * whenever an action is dispatched that might change them.
 * This guarantees data is never lost, even if the browser crashes.
 */
const persistenceMiddleware = store => next => action => {
    const result = next(action);
    const state = store.getState();

    // Save only what needs persisting
    // (Debouncing could be added here if performance becomes an issue)

    // 1. User Profile
    if (action.type.startsWith('user/')) {
        localStorage.setItem('stackpad-user', JSON.stringify(state.user.user));
    }

    // 2. Workspaces (Notes & Logs)
    if (action.type.startsWith('workspace/')) {
        localStorage.setItem('stackpad-workspaces', JSON.stringify({
            currentId: state.workspace.currentId,
            workspaces: state.workspace.workspaces
        }));
    }

    // 3. Command Vault
    if (action.type.startsWith('commands/')) {
        localStorage.setItem('stackpad-commands', JSON.stringify(state.commands));
    }

    // 4. Music Playlist
    if (action.type.startsWith('music/')) {
        localStorage.setItem('stackpad-my-playlist', JSON.stringify(state.music.playlist));
    }

    return result;
};

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        commands: commandsReducer,
        user: userReducer,
        workspace: workspaceReducer,
        music: musicReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(persistenceMiddleware),
});

export default store;
