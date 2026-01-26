/**
 * musicSlice.js - Music Player State Management
 * 
 * Manages the YouTube music player functionality.
 * Supports playing YouTube videos and full playlists.
 * The player persists across page navigation via MiniPlayer.
 * 
 * Features:
 * - Add songs/playlists by pasting YouTube URLs
 * - Play, pause, skip, previous controls
 * - Playlist persisted to localStorage
 * 
 * State shape:
 * {
 *   playlist: [
 *     {
 *       id: string,      // YouTube video/playlist ID
 *       label: string,   // User's label for the song
 *       type: string     // 'video' or 'playlist'
 *     }
 *   ],
 *   currentIndex: number,   // Which song in the playlist is playing
 *   currentSong: object,    // The currently playing song object
 *   isPlaying: boolean      // Playback state
 * }
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * loadPlaylist - Loads saved playlist from localStorage
 * 
 * Returns the user's saved playlist or empty array for new users
 */
const loadPlaylist = () => {
    try {
        const stored = localStorage.getItem('stackpad-my-playlist');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];  // Return empty array if parsing fails
    }
};

// Initial state with playlist loaded from storage
const initialState = {
    playlist: loadPlaylist(),
    currentIndex: 0,
    currentSong: null,     // No song playing initially
    isPlaying: false,
};

/**
 * Music Slice
 * 
 * Actions for controlling music playback:
 * - addSong: Add a new song/playlist to the library
 * - removeSong: Remove a song from the library
 * - playSong: Start playing a specific song
 * - playNext: Skip to next song in playlist
 * - playPrev: Go back to previous song
 * - togglePlay: Pause/resume playback
 * - stopPlayback: Stop and clear current song
 */
const musicSlice = createSlice({
    name: 'music',
    initialState,
    reducers: {
        // Add a new song to the playlist and save to localStorage
        addSong: (state, action) => {
            state.playlist.push(action.payload);
            localStorage.setItem('stackpad-my-playlist', JSON.stringify(state.playlist));
        },

        // Remove a song by ID and update localStorage
        removeSong: (state, action) => {
            state.playlist = state.playlist.filter(song => song.id !== action.payload);
            localStorage.setItem('stackpad-my-playlist', JSON.stringify(state.playlist));

            // If the removed song was playing, stop playback
            if (state.currentSong?.id === action.payload) {
                state.currentSong = null;
                state.isPlaying = false;
            }
        },

        // Start playing a specific song at a given index
        playSong: (state, action) => {
            const { song, index } = action.payload;
            state.currentSong = song;
            state.currentIndex = index;
            state.isPlaying = true;
        },

        // Play the next song in the playlist
        playNext: (state) => {
            if (state.currentIndex < state.playlist.length - 1) {
                // Move to next song
                state.currentIndex += 1;
                state.currentSong = state.playlist[state.currentIndex];
                state.isPlaying = true;
            } else {
                // Loop back to first song when reaching the end
                state.currentIndex = 0;
                state.currentSong = state.playlist[0];
                state.isPlaying = true;
            }
        },

        // Play the previous song in the playlist
        playPrev: (state) => {
            if (state.currentIndex > 0) {
                state.currentIndex -= 1;
                state.currentSong = state.playlist[state.currentIndex];
                state.isPlaying = true;
            }
            // If already at first song, do nothing
        },

        // Toggle between play and pause
        togglePlay: (state) => {
            state.isPlaying = !state.isPlaying;
        },

        // Stop playback and clear current song
        stopPlayback: (state) => {
            state.isPlaying = false;
            state.currentSong = null;
        },
    },
});

// Export actions for use in components
export const {
    addSong,
    removeSong,
    playSong,
    playNext,
    playPrev,
    togglePlay,
    stopPlayback,
} = musicSlice.actions;

// Export reducer for store configuration
export default musicSlice.reducer;
