import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { playNext, togglePlay, stopPlayback } from '../../redux/slices/musicSlice';
import './MiniPlayer.css';

export default function MiniPlayer() {
    const dispatch = useDispatch();
    const { currentSong, isPlaying, playlist, currentIndex } = useSelector((state) => state.music);
    const playerRef = useRef(null);
    const checkInterval = useRef(null);

    // Handle auto-play next song
    useEffect(() => {
        if (!currentSong || !isPlaying) return;

        // Check if video has ended every 2 seconds
        checkInterval.current = setInterval(() => {
            const iframe = playerRef.current;
            if (iframe) {
                // We can't directly detect video end from iframe,
                // so we use a message listener approach
            }
        }, 2000);

        return () => {
            if (checkInterval.current) {
                clearInterval(checkInterval.current);
            }
        };
    }, [currentSong, isPlaying]);

    // Listen for YouTube postMessage events
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== 'https://www.youtube.com') return;

            try {
                const data = JSON.parse(event.data);
                // YouTube sends playerState: 0 when video ends
                if (data.event === 'onStateChange' && data.info === 0) {
                    dispatch(playNext());
                }
            } catch (e) {
                // Not a JSON message
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch]);

    if (!currentSong) return null;

    return (
        <div className="mini-player glass-card">
            <div className="mini-player-content">
                <div className="mini-player-info">
                    <span className="mini-now-playing">🎵 Now Playing</span>
                    <span className="mini-song-title">{currentSong.title || currentSong.label}</span>
                    <span className="mini-track-info">{currentIndex + 1} / {playlist.length}</span>
                </div>

                <div className="mini-player-controls">
                    <button
                        className="mini-control-btn"
                        onClick={() => dispatch(playNext())}
                        disabled={playlist.length <= 1}
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

            {/* Hidden YouTube player - keeps playing in background */}
            <div className="mini-player-embed">
                <iframe
                    ref={playerRef}
                    src={`https://www.youtube.com/embed/${currentSong.id}?autoplay=1&enablejsapi=1`}
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
