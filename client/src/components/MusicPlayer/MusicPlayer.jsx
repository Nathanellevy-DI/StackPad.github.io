import { useState, useEffect } from 'react';
import './MusicPlayer.css';

// Curated playlists
const SPOTIFY_PLAYLISTS = [
    { id: '0vvXsWCC9xrXsKd4FyS8kM', label: 'Deep Focus', icon: '🧠', category: 'Focus' },
    { id: '37i9dQZF1DWZeKCadgRdKQ', label: 'Lo-Fi Beats', icon: '🎵', category: 'Lofi' },
    { id: '37i9dQZF1DX5trt9i14X7j', label: 'Coding Mode', icon: '💻', category: 'Focus' },
    { id: '37i9dQZF1DWWQRwui0ExPn', label: 'Chill Lofi', icon: '☕', category: 'Lofi' },
];

const APPLE_PLAYLISTS = [
    { id: 'pl.9722dd0c7e8b4746b9e2ec5e7b7c7a0a', label: 'Pure Focus', icon: '🎯', category: 'Focus' },
    { id: 'pl.3f29e145a1ee42b19be6dd6d0bbb0c70', label: 'Lo-Fi Chill', icon: '🌙', category: 'Lofi' },
];

const YOUTUBE_STREAMS = [
    { id: 'jfKfPfyJRdk', label: 'Lofi Hip Hop Radio', icon: '📻', category: 'Lofi' },
    { id: '5qap5aO4i9A', label: 'Chillhop Radio', icon: '🎧', category: 'Lofi' },
    { id: 'DWcJFNfaw9c', label: 'Jazz & Coffee', icon: '☕', category: 'Jazz' },
];

const SERVICES = [
    { id: 'spotify', label: 'Spotify', icon: '🟢' },
    { id: 'apple', label: 'Apple Music', icon: '🍎' },
    { id: 'youtube', label: 'YouTube', icon: '🔴' },
    { id: 'myplaylist', label: 'My Playlist', icon: '❤️' },
];

export default function MusicPlayer() {
    const [service, setService] = useState(() => {
        return localStorage.getItem('stackpad-music-service') || 'youtube';
    });
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [customVideoId, setCustomVideoId] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Custom playlist state
    const [myPlaylist, setMyPlaylist] = useState(() => {
        const stored = localStorage.getItem('stackpad-my-playlist');
        return stored ? JSON.parse(stored) : [];
    });
    const [newSongTitle, setNewSongTitle] = useState('');
    const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

    // Save custom playlist
    useEffect(() => {
        localStorage.setItem('stackpad-my-playlist', JSON.stringify(myPlaylist));
    }, [myPlaylist]);

    // Save service preference
    useEffect(() => {
        localStorage.setItem('stackpad-music-service', service);
        setSelectedPlaylist(null);
        setCustomVideoId('');
    }, [service]);

    const currentService = SERVICES.find(s => s.id === service);

    const getPlaylists = () => {
        switch (service) {
            case 'spotify': return SPOTIFY_PLAYLISTS;
            case 'apple': return APPLE_PLAYLISTS;
            case 'youtube': return YOUTUBE_STREAMS;
            default: return [];
        }
    };

    const extractYouTubeId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        return match ? match[1] : null;
    };

    const addToMyPlaylist = (e) => {
        e.preventDefault();
        if (!youtubeUrl.trim()) return;

        const videoId = extractYouTubeId(youtubeUrl);
        if (videoId) {
            const newSong = {
                id: videoId,
                title: newSongTitle.trim() || `Song ${myPlaylist.length + 1}`,
                addedAt: new Date().toISOString(),
            };
            setMyPlaylist([...myPlaylist, newSong]);
            setYoutubeUrl('');
            setNewSongTitle('');
        } else {
            alert('Please enter a valid YouTube URL');
        }
    };

    const removeFromPlaylist = (videoId) => {
        setMyPlaylist(myPlaylist.filter(song => song.id !== videoId));
    };

    const playFromPlaylist = (index) => {
        setCurrentPlaylistIndex(index);
        setCustomVideoId(myPlaylist[index].id);
    };

    const playNext = () => {
        if (currentPlaylistIndex < myPlaylist.length - 1) {
            playFromPlaylist(currentPlaylistIndex + 1);
        }
    };

    const playPrev = () => {
        if (currentPlaylistIndex > 0) {
            playFromPlaylist(currentPlaylistIndex - 1);
        }
    };

    const renderPlayer = () => {
        if (!selectedPlaylist && !customVideoId) {
            return (
                <div className="player-placeholder">
                    <span className="placeholder-icon">🎵</span>
                    <p>Select a playlist or add songs to your playlist</p>
                </div>
            );
        }

        if (customVideoId || service === 'myplaylist') {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${customVideoId || myPlaylist[currentPlaylistIndex]?.id}?autoplay=0`}
                    width="100%"
                    height="350"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Player"
                />
            );
        }

        switch (service) {
            case 'spotify':
                return (
                    <iframe
                        src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.id}?utm_source=generator&theme=0`}
                        width="100%"
                        height="350"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title={selectedPlaylist.label}
                    />
                );
            case 'apple':
                return (
                    <iframe
                        src={`https://embed.music.apple.com/us/playlist/${selectedPlaylist.id}?app=music`}
                        width="100%"
                        height="350"
                        frameBorder="0"
                        allow="autoplay *; encrypted-media *; fullscreen *"
                        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                        title={selectedPlaylist.label}
                    />
                );
            case 'youtube':
                return (
                    <iframe
                        src={`https://www.youtube.com/embed/${selectedPlaylist.id}?autoplay=0`}
                        width="100%"
                        height="350"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedPlaylist.label}
                    />
                );
            default:
                return null;
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
                    <p className="music-subtitle">Focus with your favorite tunes</p>
                </div>

                {/* Service Dropdown */}
                <div className="service-dropdown">
                    <button
                        className="dropdown-trigger glass-button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span>{currentService?.icon}</span>
                        <span>{currentService?.label}</span>
                        <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu glass-card">
                            {SERVICES.map((s) => (
                                <button
                                    key={s.id}
                                    className={`dropdown-item ${service === s.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setService(s.id);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                    {s.id === 'myplaylist' && myPlaylist.length > 0 && (
                                        <span className="playlist-count">{myPlaylist.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* My Playlist Builder */}
            {service === 'myplaylist' && (
                <div className="my-playlist-section">
                    <form className="add-song-form" onSubmit={addToMyPlaylist}>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Paste YouTube URL..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                        />
                        <input
                            type="text"
                            className="glass-input song-title-input"
                            placeholder="Song title (optional)"
                            value={newSongTitle}
                            onChange={(e) => setNewSongTitle(e.target.value)}
                        />
                        <button type="submit" className="glass-button primary">
                            + Add
                        </button>
                    </form>

                    {myPlaylist.length > 0 && (
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
                </div>
            )}

            <div className="music-content">
                {/* Playlist Grid (for curated playlists) */}
                {service !== 'myplaylist' && (
                    <div className="playlist-section">
                        <h3 className="section-title">
                            {service === 'youtube' ? 'Live Streams' : 'Curated Playlists'}
                        </h3>
                        <div className="playlist-grid">
                            {getPlaylists().map((playlist) => (
                                <button
                                    key={playlist.id}
                                    className={`playlist-card ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`}
                                    onClick={() => { setSelectedPlaylist(playlist); setCustomVideoId(''); }}
                                >
                                    <span className="playlist-icon">{playlist.icon}</span>
                                    <div className="playlist-info">
                                        <span className="playlist-name">{playlist.label}</span>
                                        <span className="playlist-category">{playlist.category}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Playlist Songs */}
                {service === 'myplaylist' && (
                    <div className="playlist-section">
                        <h3 className="section-title">My Songs ({myPlaylist.length})</h3>
                        <div className="playlist-grid">
                            {myPlaylist.length > 0 ? (
                                myPlaylist.map((song, index) => (
                                    <div
                                        key={song.id}
                                        className={`playlist-card my-song ${customVideoId === song.id ? 'active' : ''}`}
                                    >
                                        <button
                                            className="song-play-btn"
                                            onClick={() => playFromPlaylist(index)}
                                        >
                                            ▶
                                        </button>
                                        <div className="playlist-info" onClick={() => playFromPlaylist(index)}>
                                            <span className="playlist-name">{song.title}</span>
                                            <span className="playlist-category">YouTube</span>
                                        </div>
                                        <button
                                            className="song-remove-btn"
                                            onClick={() => removeFromPlaylist(song.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-playlist">
                                    <p>Your playlist is empty!</p>
                                    <p className="hint">Paste a YouTube URL above to add songs</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Player */}
                <div className="player-section glass-card">
                    <div className="now-playing">
                        {(selectedPlaylist || customVideoId) && (
                            <>
                                <span className="now-playing-icon">▶</span>
                                <span>Now Playing: {
                                    service === 'myplaylist' && myPlaylist[currentPlaylistIndex]
                                        ? myPlaylist[currentPlaylistIndex].title
                                        : selectedPlaylist?.label || 'Custom Video'
                                }</span>
                            </>
                        )}
                    </div>
                    <div className="player-embed">
                        {renderPlayer()}
                    </div>
                </div>
            </div>
        </div>
    );
}
