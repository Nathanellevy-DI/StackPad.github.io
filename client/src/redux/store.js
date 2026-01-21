import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import commandsReducer from './slices/commandsSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        commands: commandsReducer,
    },
});

export default store;
