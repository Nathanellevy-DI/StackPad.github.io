/**
 * SlackTab.jsx - Slack Integration Hub
 * 
 * A dedicated tab for Slack communication. 
 * Since embedding Slack directly is blocked by security policies (X-Frame-Options),
 * this component acts as a bridge and productivity tool.
 * 
 * Features:
 * - Quick Launch: Deep links to open Slack app directly
 * - Message Drafting: Persistent scratchpad for composing messages
 * - Status Dashboard: Simulates a connected state
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './SlackTab.css';

export default function SlackTab() {
    const workspace = useSelector(selectCurrentWorkspace);

    // Persistent draft state (saved to localStorage per workspace)
    const draftKey = `stackpad-slack-draft-${workspace?.id || 'default'}`;
    const [draft, setDraft] = useState(() => {
        return localStorage.getItem(draftKey) || '';
    });

    // Save draft automatically
    useEffect(() => {
        localStorage.setItem(draftKey, draft);
    }, [draft, draftKey]);

    const handleLaunchSlack = () => {
        // Deep link to open Slack desktop app
        window.location.href = 'slack://open';
    };

    const handleLaunchBrowser = () => {
        window.open('https://app.slack.com/client', '_blank');
    };

    const copyDraft = () => {
        navigator.clipboard.writeText(draft);
        // Visual feedback could be added here
    };

    return (
        <div className="slack-tab glass-card full-height">
            <div className="slack-header">
                <div className="slack-brand">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
                        alt="Slack"
                        className="slack-logo"
                    />
                    <div>
                        <h2>Slack Hub</h2>
                        <p>Communication Center</p>
                    </div>
                </div>
                <div className="slack-actions">
                    <button className="glass-button primary" onClick={handleLaunchSlack}>
                        🚀 Open App
                    </button>
                    <button className="glass-button" onClick={handleLaunchBrowser}>
                        🌐 Open Web
                    </button>
                </div>
            </div>

            <div className="slack-content">
                {/* Visual Placeholder / Dashboard */}
                <div className="slack-status-card">
                    <h3>Quick Actions</h3>
                    <div className="quick-links-grid">
                        <a href="slack://open" className="quick-link">
                            <span className="link-icon">💬</span>
                            <span>Direct Messages</span>
                        </a>
                        <a href="slack://open" className="quick-link">
                            <span className="link-icon">📢</span>
                            <span>Mentions & Reactions</span>
                        </a>
                        <a href="slack://open" className="quick-link">
                            <span className="link-icon">💾</span>
                            <span>Saved Items</span>
                        </a>
                        <a href="slack://open" className="quick-link">
                            <span className="link-icon">🔍</span>
                            <span>Search Workspace</span>
                        </a>
                    </div>
                </div>

                {/* Message Drafter */}
                <div className="message-drafter">
                    <div className="drafter-header">
                        <h3>📝 Message Drafter</h3>
                        <span className="save-status">✓ Auto-saved locally</span>
                    </div>
                    <p className="drafter-hint">
                        Compose complex messages here without worrying about accidental sends.
                        Your draft is saved automatically.
                    </p>
                    <div className="textarea-wrapper">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type your message here..."
                            className="draft-textarea glass-input"
                        />
                        <button className="copy-draft-btn" onClick={copyDraft} title="Copy to Clipboard">
                            📋 Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
