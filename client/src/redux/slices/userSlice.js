import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('stackpad-user');
        if (stored) return JSON.parse(stored);
    }
    return {
        name: 'Developer',
        email: '',
        avatarSeed: 'developer',
    };
};

const initialState = {
    user: getStoredUser(),
    isProfileOpen: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            if (typeof window !== 'undefined') {
                localStorage.setItem('stackpad-user', JSON.stringify(state.user));
            }
        },
        toggleProfileModal: (state) => {
            state.isProfileOpen = !state.isProfileOpen;
        },
        closeProfileModal: (state) => {
            state.isProfileOpen = false;
        },
    },
});

export const { updateUser, toggleProfileModal, closeProfileModal } = userSlice.actions;
export default userSlice.reducer;
