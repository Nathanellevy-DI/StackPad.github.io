/**
 * themeSlice.js - Theme State Management
 * 
 * Manages the light/dark mode theme for the entire application.
 * Uses localStorage to persist the user's preference across sessions.
 * 
 * State shape:
 * {
 *   mode: 'dark' | 'light'
 * }
 * 
 * How theme switching works:
 * 1. User clicks theme toggle
 * 2. toggleTheme action is dispatched
 * 3. State updates and saves to localStorage
 * 4. CSS variables respond to data-theme attribute on <html>
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * getInitialTheme - Determines the initial theme on app load
 * 
 * Priority:
 * 1. Previously saved preference in localStorage
 * 2. User's system preference (prefers-color-scheme)
 * 3. Default to 'dark' mode
 */
const getInitialTheme = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // First, check localStorage for saved preference
    const saved = localStorage.getItem('stackpad-theme');
    if (saved) return saved;

    // If no saved preference, check system preference
    // This respects the user's OS-level dark mode setting
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  // Fallback for server-side rendering
  return 'dark';
};

// Initial state with theme loaded from storage or system preference
const initialState = {
  mode: getInitialTheme(),
};

/**
 * Theme Slice
 * 
 * Contains two actions:
 * - toggleTheme: Switches between dark and light mode
 * - setTheme: Explicitly sets a specific theme
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Toggle between dark and light mode
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';

      // Persist to localStorage so it survives page refreshes
      if (typeof window !== 'undefined') {
        localStorage.setItem('stackpad-theme', state.mode);
        // Update the HTML attribute so CSS variables respond
        document.documentElement.setAttribute('data-theme', state.mode);
      }
    },

    // Explicitly set theme (useful for settings page)
    setTheme: (state, action) => {
      state.mode = action.payload;

      if (typeof window !== 'undefined') {
        localStorage.setItem('stackpad-theme', state.mode);
        document.documentElement.setAttribute('data-theme', state.mode);
      }
    },
  },
});

// Export actions for use in components
export const { toggleTheme, setTheme } = themeSlice.actions;

// Export reducer for store configuration
export default themeSlice.reducer;
