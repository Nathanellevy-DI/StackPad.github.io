/**
 * MusicPlayer.jsx - YouTube Music Library Component
 * 
 * The main music management page where users can:
 * - Add YouTube videos or full playlists to their library
 * - View and manage their song/playlist collection
 * - Play songs (audio persists across page navigation via MiniPlayer)
 * - Use quick-start buttons for popular live streams
 * 
 * How it works:
 * - Users paste YouTube URLs (videos or playlists)
 * - URLs are parsed to extract video/playlist IDs
 * - Songs are stored in Redux and localStorage
 * - Actual playback happens in MiniPlayer.jsx (persists across pages)
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSong, removeSong, playSong, playNext, playPrev } from '../../redux/slices/musicSlice';
import './MusicPlayer.css';

// ============================================
// QUICK START STREAMS
// Popular 24/7 live radio streams for instant listening
// These are well-known YouTube live streams that are always on
// ============================================
const STARTER_STREAMS = [
    { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', icon: '🎧', type: 'video' },
    { id: 'DWcJFNfaw9c', title: 'Jazz & Coffee', icon: '☕', type: 'video' },
    { id: 'Na0w3Mz46GA', title: 'Synthwave Radio', icon: '🌆', type: 'video' },
    { id: 'hHW1oY26kxQ', title: 'Classical Focus', icon: '🎻', type: 'video' },
];

export default function MusicPlayer() {
    const dispatch = useDispatch();

    // Get music state from Redux
    const { playlist, currentSong, currentIndex, isPlaying } = useSelector((state) => state.music);

    // Form state for adding new songs
    const [newSongUrl, setNewSongUrl] = useState('');
    const [newSongTitle, setNewSongTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    /**
     * parseYouTubeUrl - Extracts video or playlist ID from YouTube URL
     * 
     * Supports multiple URL formats:
     * - youtube.com/watch?v=VIDEO_ID
     * - youtu.be/VIDEO_ID
     * - youtube.com/embed/VIDEO_ID
     * - youtube.com/playlist?list=PLAYLIST_ID
     * - youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID (prioritizes playlist)
     * 
     * Returns: { type: 'video'|'playlist', id: string } or null if invalid
     */
    const parseYouTubeUrl = (url) => {
        // Check for playlist URL first (takes priority)
        const playlistMatch = url.match(/[?&]list=([^&\s]+)/);
        if (playlistMatch) {
            return { type: 'playlist', id: playlistMatch[1] };
        }

        // Check for video URL
        const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        if (videoMatch) {
            return { type: 'video', id: videoMatch[1] };
        }

        return null;  // Invalid URL
    };

    /**
     * handleAddSong - Adds a new song/playlist to the library
     * Parses URL, creates song object, adds to Redux store
     */
    const handleAddSong = (e) => {
        e.preventDefault();
        if (!newSongUrl.trim()) return;

        const parsed = parseYouTubeUrl(newSongUrl);
        if (parsed) {
            const newSong = {
                id: parsed.id,
                type: parsed.type,
                title: newSongTitle.trim() || (parsed.type === 'playlist' ? `Playlist ${playlist.length + 1}` : `Song ${playlist.length + 1}`),
                addedAt: new Date().toISOString(),
            };
            dispatch(addSong(newSong));
            setNewSongUrl('');
            setNewSongTitle('');
            setShowAddForm(false);

            // Auto-play if this is the first song added
            if (playlist.length === 0) {
                dispatch(playSong({ song: newSong, index: 0 }));
            }
        } else {
            alert('Please enter a valid YouTube video or playlist URL');
        }
    };

    /**
     * handlePlaySong - Starts playing a specific song
     */
    const handlePlaySong = (song, index) => {
        dispatch(playSong({ song, index }));
    };

    /**
     * handleRemoveSong - Removes a song from the library
     */
    const handleRemoveSong = (songId) => {
        dispatch(removeSong(songId));
    };

    /**
     * handlePlayStream - Plays a quick-start stream
     * Adds to library if not already there, then plays it
     */
    const handlePlayStream = (stream) => {
        const exists = playlist.find(s => s.id === stream.id);
        if (!exists) {
            dispatch(addSong(stream));
            dispatch(playSong({ song: stream, index: playlist.length }));
        } else {
            const index = playlist.findIndex(s => s.id === stream.id);
            dispatch(playSong({ song: stream, index }));
        }
    };

    return (
        <div className="music-player-page">
            {/* Page Header */}
            <div className="music-header">
                <div>
                    <h2 className="music-title">
                        <span className="title-icon">🎵</span>
                        Music Player
                    </h2>
                    <p className="music-subtitle">Build your playlist • Music plays across all pages</p>
                </div>
            </div>

            {/* ====== ADD SONG SECTION ====== */}
            <div className="add-song-section glass-card">
                <div className="add-song-header">
                    <h3>➕ Add Songs or Playlists</h3>
                    <button
                        className="glass-button small"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? '✕ Cancel' : 'Add Music'}
                    </button>
                </div>

                {/* Add song form (hidden by default) */}
                {showAddForm && (
                    <form className="add-song-form" onSubmit={handleAddSong}>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Paste YouTube video or playlist URL..."
                            value={newSongUrl}
                            onChange={(e) => setNewSongUrl(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Name (optional)"
                            value={newSongTitle}
                            onChange={(e) => setNewSongTitle(e.target.value)}
                        />
                        <button type="submit" className="glass-button primary">
                            Add to Library
                        </button>
                    </form>
                )}

                {/* Helpful hints */}
                <div className="add-hints">
                    <p className="add-hint">
                        🎵 <strong>Single song:</strong> Paste any YouTube video URL
                    </p>
                    <p className="add-hint">
                        📋 <strong>Full playlist:</strong> Paste a YouTube playlist URL - it will play all songs automatically!
                    </p>
                </div>
            </div>

            <div className="music-content">
                {/* ====== MY LIBRARY (Playlist) ====== */}
                <div className="playlist-section">
                    <h3 className="section-title">❤️ My Library ({playlist.length})</h3>

                    <div className="playlist-songs">
                        {playlist.length > 0 ? (
                            playlist.map((song, index) => (
                                <div
                                    key={song.id + index}
                                    className={`song-item ${currentSong?.id === song.id ? 'playing' : ''} ${song.type === 'playlist' ? 'is-playlist' : ''}`}
                                >
                                    {/* Play button with current status indicator */}
                                    <button
                                        className="song-play-btn"
                                        onClick={() => handlePlaySong(song, index)}
                                    >
                                        {currentSong?.id === song.id && isPlaying ? '▶' : '○'}
                                    </button>

                                    {/* Song info */}
                                    <div className="song-info">
                                        <span className="song-title" onClick={() => handlePlaySong(song, index)}>
                                            {song.type === 'playlist' && '📋 '}{song.title}
                                        </span>
                                        {song.type === 'playlist' && (
                                            <span className="song-badge">Playlist</span>
                                        )}
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        className="song-remove-btn"
                                        onClick={() => handleRemoveSong(song.id)}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-playlist">
                                <span className="empty-icon">🎵</span>
                                <p>Your library is empty</p>
                                <p className="hint">Add songs or playlists above to get started!</p>
                            </div>
                        )}
                    </div>

                    {/* Prev/Next controls when multiple songs */}
                    {playlist.length > 1 && currentSong && (
                        <div className="playlist-controls">
                            <button
                                className="control-btn"
                                onClick={() => dispatch(playPrev())}
                                disabled={currentIndex === 0}
                            >
                                ⏮ Prev
                            </button>
                            <span className="track-info">
                                {currentIndex + 1} / {playlist.length}
                            </span>
                            <button
                                className="control-btn"
                                onClick={() => dispatch(playNext())}
                            >
                                Next ⏭
                            </button>
                        </div>
                    )}

                    {/* ====== QUICK START BUTTONS ====== */}
                    <div className="quick-start">
                        <h4 className="quick-label">🚀 Quick Start (Live Radio Streams)</h4>
                        <div className="quick-grid">
                            {STARTER_STREAMS.map((stream) => (
                                <button
                                    key={stream.id}
                                    className={`quick-btn ${currentSong?.id === stream.id ? 'active' : ''}`}
                                    onClick={() => handlePlayStream(stream)}
                                >
                                    <span>{stream.icon}</span>
                                    <span>{stream.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ====== NOW PLAYING SECTION ====== */}
                <div className="player-section glass-card">
                    {currentSong ? (
                        <>
                            <div className="now-playing-header">
                                <span className="now-playing-label">▶ Now Playing</span>
                                <span className="now-playing-title">
                                    {currentSong.type === 'playlist' && '📋 '}{currentSong.title}
                                </span>
                            </div>
                            <div className="player-info">
                                <p>🎧 Music is playing in the mini-player below</p>
                                {currentSong.type === 'playlist' ? (
                                    <p className="info-hint">This is a playlist - songs will auto-play!</p>
                                ) : (
                                    <p className="info-hint">Switch to any other page - music keeps playing!</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="player-placeholder">
                            <span className="placeholder-icon">🎵</span>
                            <p>Select a song or add one to start playing</p>
                            <p className="hint">Music will continue playing as you work!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
