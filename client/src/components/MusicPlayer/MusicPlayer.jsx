import { useState, useEffect } from 'react';
import './MusicPlayer.css';

// Example starting playlists (various genres)
const STARTER_PLAYLISTS = [
    { id: 'jfKfPfyJRdk', label: 'Lofi Hip Hop Radio', icon: '🎧', category: 'Lofi' },
    { id: 'DWcJFNfaw9c', label: 'Jazz & Coffee', icon: '☕', category: 'Jazz' },
    { id: 'Na0w3Mz46GA', label: 'Synthwave Radio', icon: '🌆', category: 'Electronic' },
    { id: 'hHW1oY26kxQ', label: 'Classical Focus', icon: '🎻', category: 'Classical' },
    { id: '36YnV9STBqc', label: 'Pop Hits Mix', icon: '🎤', category: 'Pop' },
    { id: 'Dx5qFachd3A', label: 'Rock Classics', icon: '🎸', category: 'Rock' },
];

export default function MusicPlayer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentVideo, setCurrentVideo] = useState(null);

    // Custom playlist (saved songs)
    const [myPlaylist, setMyPlaylist] = useState(() => {
        const stored = localStorage.getItem('stackpad-my-playlist');
        return stored ? JSON.parse(stored) : [];
    });
    const [newSongUrl, setNewSongUrl] = useState('');
    const [newSongTitle, setNewSongTitle] = useState('');
    const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);

    // Save custom playlist
    useEffect(() => {
        localStorage.setItem('stackpad-my-playlist', JSON.stringify(myPlaylist));
    }, [myPlaylist]);

    const extractYouTubeId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        return match ? match[1] : null;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        // Open YouTube search in new tab - user can find and copy URL
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' music')}`, '_blank');
    };

    const addToPlaylist = (e) => {
        e.preventDefault();
        if (!newSongUrl.trim()) return;

        const videoId = extractYouTubeId(newSongUrl);
        if (videoId) {
            const newSong = {
                id: videoId,
                title: newSongTitle.trim() || `Song ${myPlaylist.length + 1}`,
                addedAt: new Date().toISOString(),
            };
            setMyPlaylist([...myPlaylist, newSong]);
            setNewSongUrl('');
            setNewSongTitle('');
            setShowAddForm(false);
            // Auto-play newly added song
            setCurrentVideo(newSong);
        } else {
            alert('Please enter a valid YouTube URL');
        }
    };

    const removeFromPlaylist = (videoId) => {
        setMyPlaylist(myPlaylist.filter(song => song.id !== videoId));
        if (currentVideo?.id === videoId) {
            setCurrentVideo(null);
        }
    };

    const playFromPlaylist = (song, index) => {
        setCurrentVideo(song);
        setCurrentPlaylistIndex(index);
    };

    const playNext = () => {
        if (currentPlaylistIndex < myPlaylist.length - 1) {
            const nextIndex = currentPlaylistIndex + 1;
            setCurrentPlaylistIndex(nextIndex);
            setCurrentVideo(myPlaylist[nextIndex]);
        }
    };

    const playPrev = () => {
        if (currentPlaylistIndex > 0) {
            const prevIndex = currentPlaylistIndex - 1;
            setCurrentPlaylistIndex(prevIndex);
            setCurrentVideo(myPlaylist[prevIndex]);
        }
    };

    const playStarterPlaylist = (playlist) => {
        setCurrentVideo(playlist);
    };

    return (
        <div className="music-player-page">
            <div className="music-header">
                <div>
                    <h2 className="music-title">
                        <span className="title-icon">🎵</span>
                        Music Player
                    </h2>
                    <p className="music-subtitle">Search for any song or build your playlist</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section glass-card">
                <h3 className="section-label">🔍 Search for Music</h3>
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="glass-input search-input"
                        placeholder="Search for any song, artist, or genre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="glass-button primary">
                        Search YouTube
                    </button>
                </form>
                <p className="search-hint">Find a song, then copy its URL and add it to your playlist below!</p>
            </div>

            <div className="music-content">
                {/* My Playlist Section */}
                <div className="playlist-section">
                    <div className="playlist-header">
                        <h3 className="section-title">❤️ My Playlist ({myPlaylist.length})</h3>
                        <button
                            className="glass-button small"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            {showAddForm ? '✕ Cancel' : '+ Add Song'}
                        </button>
                    </div>

                    {/* Add Song Form */}
                    {showAddForm && (
                        <form className="add-song-form" onSubmit={addToPlaylist}>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Paste YouTube URL here..."
                                value={newSongUrl}
                                onChange={(e) => setNewSongUrl(e.target.value)}
                            />
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Song name (optional)"
                                value={newSongTitle}
                                onChange={(e) => setNewSongTitle(e.target.value)}
                            />
                            <button type="submit" className="glass-button primary">
                                Add to Playlist
                            </button>
                        </form>
                    )}

                    {/* Playlist Songs */}
                    <div className="playlist-songs">
                        {myPlaylist.length > 0 ? (
                            myPlaylist.map((song, index) => (
                                <div
                                    key={song.id + index}
                                    className={`song-item ${currentVideo?.id === song.id ? 'playing' : ''}`}
                                >
                                    <button
                                        className="song-play-btn"
                                        onClick={() => playFromPlaylist(song, index)}
                                    >
                                        {currentVideo?.id === song.id ? '▶' : '○'}
                                    </button>
                                    <span className="song-title" onClick={() => playFromPlaylist(song, index)}>
                                        {song.title}
                                    </span>
                                    <button
                                        className="song-remove-btn"
                                        onClick={() => removeFromPlaylist(song.id)}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-playlist">
                                <p>Your playlist is empty</p>
                                <p className="hint">Search for songs above and add them here!</p>
                            </div>
                        )}
                    </div>

                    {/* Playlist Controls */}
                    {myPlaylist.length > 1 && currentVideo && (
                        <div className="playlist-controls">
                            <button
                                className="control-btn"
                                onClick={playPrev}
                                disabled={currentPlaylistIndex === 0}
                            >
                                ⏮ Prev
                            </button>
                            <span className="track-info">
                                {currentPlaylistIndex + 1} / {myPlaylist.length}
                            </span>
                            <button
                                className="control-btn"
                                onClick={playNext}
                                disabled={currentPlaylistIndex >= myPlaylist.length - 1}
                            >
                                Next ⏭
                            </button>
                        </div>
                    )}

                    {/* Quick Start Playlists */}
                    <div className="quick-start">
                        <h4 className="quick-label">Quick Start (Live Streams)</h4>
                        <div className="quick-grid">
                            {STARTER_PLAYLISTS.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    className={`quick-btn ${currentVideo?.id === playlist.id ? 'active' : ''}`}
                                    onClick={() => playStarterPlaylist(playlist)}
                                >
                                    <span>{playlist.icon}</span>
                                    <span>{playlist.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Player Section */}
                <div className="player-section glass-card">
                    {currentVideo ? (
                        <>
                            <div className="now-playing">
                                <span className="now-playing-icon">▶</span>
                                <span>Now Playing: {currentVideo.title || currentVideo.label}</span>
                            </div>
                            <div className="player-embed">
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=0`}
                                    width="100%"
                                    height="400"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="YouTube Player"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="player-placeholder">
                            <span className="placeholder-icon">🎵</span>
                            <p>Search for a song or select from quick start to begin!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
