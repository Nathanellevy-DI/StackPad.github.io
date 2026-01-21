import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { playNext, playPrev, stopPlayback } from '../../redux/slices/musicSlice';
import './MiniPlayer.css';

export default function MiniPlayer() {
    const dispatch = useDispatch();
    const { currentSong, isPlaying, playlist, currentIndex } = useSelector((state) => state.music);
    const playerRef = useRef(null);

    // Listen for YouTube postMessage events (for auto-play next)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== 'https://www.youtube.com') return;

            try {
                const data = JSON.parse(event.data);
                // YouTube sends playerState: 0 when video ends
                if (data.event === 'onStateChange' && data.info === 0) {
                    // Only auto-next for single videos, not playlists
                    if (currentSong?.type !== 'playlist') {
                        dispatch(playNext());
                    }
                }
            } catch (e) {
                // Not a JSON message
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, currentSong]);

    if (!currentSong) return null;

    // Build the correct embed URL based on type
    const getEmbedUrl = () => {
        if (currentSong.type === 'playlist') {
            return `https://www.youtube.com/embed/videoseries?list=${currentSong.id}&autoplay=1&enablejsapi=1`;
        }
        return `https://www.youtube.com/embed/${currentSong.id}?autoplay=1&enablejsapi=1`;
    };

    return (
        <div className="mini-player glass-card">
            <div className="mini-player-content">
                <div className="mini-player-info">
                    <span className="mini-now-playing">
                        {currentSong.type === 'playlist' ? '📋 Playlist' : '🎵 Now Playing'}
                    </span>
                    <span className="mini-song-title">{currentSong.title || currentSong.label}</span>
                    <span className="mini-track-info">{currentIndex + 1} / {playlist.length}</span>
                </div>

                <div className="mini-player-controls">
                    <button
                        className="mini-control-btn"
                        onClick={() => dispatch(playPrev())}
                        disabled={currentIndex === 0}
                        title="Previous"
                    >
                        ⏮
                    </button>
                    <button
                        className="mini-control-btn stop"
                        onClick={() => dispatch(stopPlayback())}
                        title="Stop"
                    >
                        ⏹
                    </button>
                    <button
                        className="mini-control-btn"
                        onClick={() => dispatch(playNext())}
                        title="Next"
                    >
                        ⏭
                    </button>
                </div>
            </div>

            {/* YouTube player - keeps playing in background */}
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
