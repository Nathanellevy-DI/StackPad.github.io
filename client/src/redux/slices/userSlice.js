/**
 * userSlice.js - User Profile State Management
 * 
 * Manages user profile data including:
 * - Display name
 * - Email (optional)
 * - Avatar (using DiceBear API)
 * - LinkedIn URL (for the header link)
 * 
 * Also controls the profile edit modal visibility.
 * All data is persisted to localStorage.
 * 
 * State shape:
 * {
 *   user: {
 *     name: string,
 *     email: string,
 *     avatarSeed: string,    // Used to generate avatar via DiceBear
 *     linkedinUrl: string    // Displayed in header
 *   },
 *   isProfileOpen: boolean   // Controls modal visibility
 * }
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * getStoredUser - Loads user data from localStorage on app start
 * 
 * Returns saved user data or default values for new users
 */
const getStoredUser = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('stackpad-user');
        if (stored) return JSON.parse(stored);
    }
    // Default user for first-time visitors
    return {
        name: 'Developer',
        email: '',
        avatarSeed: 'developer',  // Creates a consistent avatar
        linkedinUrl: '',          // Empty until user sets it
    };
};

const initialState = {
    user: getStoredUser(),
    isProfileOpen: false,  // Profile modal starts closed
};

/**
 * User Slice
 * 
 * Actions:
 * - updateUser: Updates user profile fields
 * - toggleProfileModal: Opens/closes the profile edit modal
 * - closeProfileModal: Explicitly closes the modal
 */
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Update user profile with new data
        // Uses spread operator to merge new fields with existing data
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };

            // Save to localStorage for persistence
            if (typeof window !== 'undefined') {
                localStorage.setItem('stackpad-user', JSON.stringify(state.user));
            }
        },

        // Toggle profile modal visibility
        toggleProfileModal: (state) => {
            state.isProfileOpen = !state.isProfileOpen;
        },

        // Explicitly close the modal (used when saving or clicking outside)
        closeProfileModal: (state) => {
            state.isProfileOpen = false;
        },
    },
});

// Export actions for use in components
export const { updateUser, toggleProfileModal, closeProfileModal } = userSlice.actions;

// Export reducer for store configuration
export default userSlice.reducer;
