import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { toggleProfileModal } from '../../redux/slices/userSlice';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import WorkspaceSwitcher from '../WorkspaceSwitcher/WorkspaceSwitcher';
import './Header.css';

const MOTIVATIONAL_MESSAGES = [
    { text: "You're doing great! Keep it up! 💪", icon: "🚀" },
    { text: "💧 Remember to drink some water!", icon: "💧" },
    { text: "Small progress is still progress! ✨", icon: "✨" },
    { text: "Take a deep breath. You've got this! 🧘", icon: "🧘" },
    { text: "💧 Hydration check - grab some water!", icon: "💧" },
    { text: "One step at a time. You're making progress! 👣", icon: "👣" },
    { text: "Great things take time. Stay focused! 🎯", icon: "🎯" },
    { text: "💧 Time for a water break!", icon: "💧" },
    { text: "Believe in yourself! You're capable of amazing things! 🌟", icon: "🌟" },
    { text: "Remember: breaks boost productivity! ☕", icon: "☕" },
    { text: "💧 Your brain needs water to function! 🧠", icon: "💧" },
    { text: "Every line of code matters! 💻", icon: "💻" },
    { text: "You're building something awesome! 🏗️", icon: "🏗️" },
    { text: "💧 Quick water break? Stay hydrated! 💧", icon: "💧" },
    { text: "Keep crushing it! You're a rockstar! 🎸", icon: "🎸" },
    { text: "Stretch those muscles! 🤸", icon: "🤸" },
    { text: "Your dedication is inspiring! 💎", icon: "💎" },
];

export default function Header() {
    const dispatch = useDispatch();
    const { mode } = useSelector((state) => state.theme);
    const { user } = useSelector((state) => state.user);
    const currentWorkspace = useSelector(selectCurrentWorkspace);
    const [messageIndex, setMessageIndex] = useState(0);

    // Rotate messages every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const currentMessage = MOTIVATIONAL_MESSAGES[messageIndex];

    // Get dynamic URLs
    const githubUrl = currentWorkspace?.githubUrl || '';
    const linkedinUrl = user?.linkedinUrl || '';

    return (
        <header className="header glass-card">
            <div className="header-left">
                <div className="logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">StackPad</span>
                </div>
                <WorkspaceSwitcher />
            </div>

            <div className="header-center">
                <div className="motivation-banner">
                    <span className="motivation-text">{currentMessage.text}</span>
                </div>
            </div>

            <div className="header-right">
                {/* GitHub Link - Dynamic per workspace */}
                <a
                    href={githubUrl || '#'}
                    target={githubUrl ? '_blank' : undefined}
                    rel={githubUrl ? 'noopener noreferrer' : undefined}
                    className={`header-icon-btn ${!githubUrl ? 'disabled' : ''}`}
                    title={githubUrl ? 'Open GitHub Repo' : 'No GitHub URL set for this workspace'}
                    onClick={(e) => !githubUrl && e.preventDefault()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                </a>

                {/* LinkedIn Link - Dynamic per user */}
                <a
                    href={linkedinUrl || '#'}
                    target={linkedinUrl ? '_blank' : undefined}
                    rel={linkedinUrl ? 'noopener noreferrer' : undefined}
                    className={`header-icon-btn ${!linkedinUrl ? 'disabled' : ''}`}
                    title={linkedinUrl ? 'Open LinkedIn Profile' : 'Set your LinkedIn URL in Profile'}
                    onClick={(e) => !linkedinUrl && e.preventDefault()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                </a>

                {/* Theme Toggle */}
                <button
                    className="theme-toggle"
                    onClick={() => dispatch(toggleTheme())}
                    title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                >
                    <span className="theme-icon sun">☀️</span>
                    <span className="theme-icon moon">🌙</span>
                    <span className={`toggle-slider ${mode}`}></span>
                </button>

                {/* User Avatar - Clickable */}
                <button
                    className="user-avatar-btn"
                    onClick={() => dispatch(toggleProfileModal())}
                    title="Edit Profile"
                >
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`}
                        alt="User avatar"
                    />
                </button>
            </div>
        </header>
    );
}
