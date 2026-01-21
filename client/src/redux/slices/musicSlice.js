import { createSlice } from '@reduxjs/toolkit';

// Load saved playlist from localStorage
const loadPlaylist = () => {
    try {
        const stored = localStorage.getItem('stackpad-my-playlist');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const initialState = {
    playlist: loadPlaylist(),
    currentIndex: 0,
    currentSong: null,
    isPlaying: false,
};

const musicSlice = createSlice({
    name: 'music',
    initialState,
    reducers: {
        addSong: (state, action) => {
            state.playlist.push(action.payload);
            localStorage.setItem('stackpad-my-playlist', JSON.stringify(state.playlist));
        },
        removeSong: (state, action) => {
            state.playlist = state.playlist.filter(song => song.id !== action.payload);
            localStorage.setItem('stackpad-my-playlist', JSON.stringify(state.playlist));
            // Reset if current song was removed
            if (state.currentSong?.id === action.payload) {
                state.currentSong = null;
                state.isPlaying = false;
            }
        },
        playSong: (state, action) => {
            const { song, index } = action.payload;
            state.currentSong = song;
            state.currentIndex = index;
            state.isPlaying = true;
        },
        playNext: (state) => {
            if (state.currentIndex < state.playlist.length - 1) {
                state.currentIndex += 1;
                state.currentSong = state.playlist[state.currentIndex];
                state.isPlaying = true;
            } else {
                // Loop back to start
                state.currentIndex = 0;
                state.currentSong = state.playlist[0];
                state.isPlaying = true;
            }
        },
        playPrev: (state) => {
            if (state.currentIndex > 0) {
                state.currentIndex -= 1;
                state.currentSong = state.playlist[state.currentIndex];
                state.isPlaying = true;
            }
        },
        togglePlay: (state) => {
            state.isPlaying = !state.isPlaying;
        },
        stopPlayback: (state) => {
            state.isPlaying = false;
            state.currentSong = null;
        },
    },
});

export const {
    addSong,
    removeSong,
    playSong,
    playNext,
    playPrev,
    togglePlay,
    stopPlayback,
} = musicSlice.actions;

export default musicSlice.reducer;
