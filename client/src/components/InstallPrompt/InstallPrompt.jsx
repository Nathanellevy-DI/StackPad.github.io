/**
 * InstallPrompt.jsx - PWA Installation Banner
 * 
 * Detects if the app is running in a browser (not standalone) and prompts
 * the user to add it to their home screen for a full app-like experience.
 * 
 * Features:
 * - Detects iOS vs Android/Desktop
 * - Shows specific instructions for iOS (Share -> Add to Home Screen)
 * - Uses native `beforeinstallprompt` event for Android/Chrome
 * - Persistent dismissal (doesn't show again if user closes it)
 */

import { useState, useEffect } from 'react';
import './InstallPrompt.css';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Check if already installed/standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;

        if (isStandalone) return; // Don't show if already installed

        // 2. Check if user previously dismissed it
        const isDismissed = localStorage.getItem('stackpad-install-dismissed');
        if (isDismissed) return;

        // 3. Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            // iOS doesn't support beforeinstallprompt, show custom banner immediately
            setShowPrompt(true);
        } else {
            // Android/Chrome: Listen for native event
            const handleBeforeInstallPrompt = (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setShowPrompt(true);
            };

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
    }, []);

    const handleInstallClick = async () => {
        if (!isIOS && deferredPrompt) {
            // Trigger native Android install prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('stackpad-install-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="install-prompt glass-card">
            <div className="prompt-content">
                <span className="prompt-icon">📱</span>
                <div className="prompt-text">
                    <h3>Install StackPad</h3>
                    <p>
                        {isIOS
                            ? 'Install this app on your home screen for full-screen view.'
                            : 'Install specifically for a better dashboard experience.'}
                    </p>
                </div>
            </div>

            {isIOS ? (
                // iOS Instructions
                <div className="ios-instructions">
                    <p>Tap <span className="share-icon">⎋</span> Share then "Add to Home Screen" <span className="plus-icon">➕</span></p>
                    <button className="glass-button small" onClick={handleDismiss}>Close</button>
                </div>
            ) : (
                // Android/Desktop Button
                <div className="prompt-actions">
                    <button className="glass-button primary" onClick={handleInstallClick}>
                        Install App
                    </button>
                    <button className="glass-button small" onClick={handleDismiss}>
                        Not Now
                    </button>
                </div>
            )}
        </div>
    );
}
