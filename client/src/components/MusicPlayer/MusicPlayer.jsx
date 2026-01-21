import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSong, removeSong, playSong, playNext, playPrev } from '../../redux/slices/musicSlice';
import './MusicPlayer.css';

// Quick start streams
const STARTER_STREAMS = [
    { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', icon: '🎧', type: 'video' },
    { id: 'DWcJFNfaw9c', title: 'Jazz & Coffee', icon: '☕', type: 'video' },
    { id: 'Na0w3Mz46GA', title: 'Synthwave Radio', icon: '🌆', type: 'video' },
    { id: 'hHW1oY26kxQ', title: 'Classical Focus', icon: '🎻', type: 'video' },
];

export default function MusicPlayer() {
    const dispatch = useDispatch();
    const { playlist, currentSong, currentIndex, isPlaying } = useSelector((state) => state.music);

    const [newSongUrl, setNewSongUrl] = useState('');
    const [newSongTitle, setNewSongTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Extract video ID or playlist ID from URL
    const parseYouTubeUrl = (url) => {
        // Check for playlist URL first
        const playlistMatch = url.match(/[?&]list=([^&\s]+)/);
        if (playlistMatch) {
            return { type: 'playlist', id: playlistMatch[1] };
        }

        // Check for video URL
        const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        if (videoMatch) {
            return { type: 'video', id: videoMatch[1] };
        }

        return null;
    };

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

            // Auto-play if first song
            if (playlist.length === 0) {
                dispatch(playSong({ song: newSong, index: 0 }));
            }
        } else {
            alert('Please enter a valid YouTube video or playlist URL');
        }
    };

    const handlePlaySong = (song, index) => {
        dispatch(playSong({ song, index }));
    };

    const handleRemoveSong = (songId) => {
        dispatch(removeSong(songId));
    };

    const handlePlayStream = (stream) => {
        // Add stream to playlist if not exists and play it
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
            <div className="music-header">
                <div>
                    <h2 className="music-title">
                        <span className="title-icon">🎵</span>
                        Music Player
                    </h2>
                    <p className="music-subtitle">Build your playlist • Music plays across all pages</p>
                </div>
            </div>

            {/* Add Song Section */}
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
                {/* My Playlist */}
                <div className="playlist-section">
                    <h3 className="section-title">❤️ My Library ({playlist.length})</h3>

                    <div className="playlist-songs">
                        {playlist.length > 0 ? (
                            playlist.map((song, index) => (
                                <div
                                    key={song.id + index}
                                    className={`song-item ${currentSong?.id === song.id ? 'playing' : ''} ${song.type === 'playlist' ? 'is-playlist' : ''}`}
                                >
                                    <button
                                        className="song-play-btn"
                                        onClick={() => handlePlaySong(song, index)}
                                    >
                                        {currentSong?.id === song.id && isPlaying ? '▶' : '○'}
                                    </button>
                                    <div className="song-info">
                                        <span className="song-title" onClick={() => handlePlaySong(song, index)}>
                                            {song.type === 'playlist' && '📋 '}{song.title}
                                        </span>
                                        {song.type === 'playlist' && (
                                            <span className="song-badge">Playlist</span>
                                        )}
                                    </div>
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

                    {/* Playlist Controls */}
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

                    {/* Quick Start */}
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

                {/* Now Playing Preview */}
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
