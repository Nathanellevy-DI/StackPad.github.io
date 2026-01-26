/**
 * MiniPlayer.jsx - Persistent YouTube Player Component
 * 
 * A compact music player that appears at the bottom of the screen.
 * This is the actual YouTube player that plays audio.
 * 
 * Why it exists:
 * - The music needs to keep playing when users navigate between pages
 * - This component is rendered in App.jsx outside the main content area
 * - It stays mounted even when the MusicPlayer page is not active
 * 
 * Features:
 * - Embedded YouTube iframe (video or playlist)
 * - Previous/Stop/Next controls
 * - Shows current track info
 * - Auto-advances to next song when a track ends (for single videos)
 * - Supports both individual videos and full playlists
 */

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { playNext, playPrev, stopPlayback } from '../../redux/slices/musicSlice';
import './MiniPlayer.css';

export default function MiniPlayer() {
    const dispatch = useDispatch();

    // Get music state from Redux
    const { currentSong, isPlaying, playlist, currentIndex } = useSelector((state) => state.music);

    // Ref to the iframe element
    const playerRef = useRef(null);

    // ============================================
    // AUTO-PLAY NEXT SONG
    // Listen for YouTube's postMessage events to detect when video ends
    // ============================================
    useEffect(() => {
        const handleMessage = (event) => {
            // Only accept messages from YouTube
            if (event.origin !== 'https://www.youtube.com') return;

            try {
                const data = JSON.parse(event.data);
                // YouTube sends playerState: 0 when video ends
                if (data.event === 'onStateChange' && data.info === 0) {
                    // Only auto-next for single videos, not playlists
                    // (Playlists handle their own advancement)
                    if (currentSong?.type !== 'playlist') {
                        dispatch(playNext());
                    }
                }
            } catch (e) {
                // Not a JSON message - ignore
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, currentSong]);

    // Don't render anything if no song is selected
    if (!currentSong) return null;

    /**
     * getEmbedUrl - Builds the correct YouTube embed URL
     * 
     * For playlists: Uses videoseries endpoint
     * For videos: Uses regular embed with autoplay
     * 
     * enablejsapi=1 is needed for YouTube to send postMessage events
     */
    const getEmbedUrl = () => {
        if (currentSong.type === 'playlist') {
            return `https://www.youtube.com/embed/videoseries?list=${currentSong.id}&autoplay=1&enablejsapi=1`;
        }
        return `https://www.youtube.com/embed/${currentSong.id}?autoplay=1&enablejsapi=1`;
    };

    return (
        <div className="mini-player glass-card">
            {/* Player info and controls */}
            <div className="mini-player-content">
                {/* Currently playing info */}
                <div className="mini-player-info">
                    <span className="mini-now-playing">
                        {currentSong.type === 'playlist' ? '📋 Playlist' : '🎵 Now Playing'}
                    </span>
                    <span className="mini-song-title">{currentSong.title || currentSong.label}</span>
                    <span className="mini-track-info">{currentIndex + 1} / {playlist.length}</span>
                </div>

                {/* Playback controls */}
                <div className="mini-player-controls">
                    {/* Previous button */}
                    <button
                        className="mini-control-btn"
                        onClick={() => dispatch(playPrev())}
                        disabled={currentIndex === 0}
                        title="Previous"
                    >
                        ⏮
                    </button>

                    {/* Stop button */}
                    <button
                        className="mini-control-btn stop"
                        onClick={() => dispatch(stopPlayback())}
                        title="Stop"
                    >
                        ⏹
                    </button>

                    {/* Next button */}
                    <button
                        className="mini-control-btn"
                        onClick={() => dispatch(playNext())}
                        title="Next"
                    >
                        ⏭
                    </button>
                </div>
            </div>

            {/* ====== YOUTUBE IFRAME ====== */}
            {/* This is where the actual audio/video plays */}
            {/* It stays mounted so music continues while navigating */}
            <div className="mini-player-embed">
                <iframe
                    ref={playerRef}
                    src={getEmbedUrl()}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Music Player"
                />
            </div>
        </div>
    );
}
