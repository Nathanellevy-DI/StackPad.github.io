import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import commandsReducer from './slices/commandsSlice';
import userReducer from './slices/userSlice';
import workspaceReducer from './slices/workspaceSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        commands: commandsReducer,
        user: userReducer,
        workspace: workspaceReducer,
    },
});

export default store;
