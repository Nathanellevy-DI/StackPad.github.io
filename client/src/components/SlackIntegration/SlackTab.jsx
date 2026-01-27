/**
 * SlackTab.jsx - Slack Integration Hub
 * 
 * A dedicated tab for Slack communication. 
 * Since embedding Slack directly is blocked by security policies (X-Frame-Options),
 * this component acts as a bridge and productivity tool.
 * 
 * Features:
 * - Quick Launch: Deep links to open Slack app directly
 * - Satellite Mode: Launches Slack in a "sidecar" popup window
 * - Message Drafting: Persistent scratchpad for composing messages
 * - Webhook Integration: Send messages directly to a channel
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './SlackTab.css';

export default function SlackTab() {
    const workspace = useSelector(selectCurrentWorkspace);
    const workspaceId = workspace?.id || 'default';

    // Persistent draft state
    const draftKey = `stackpad-slack-draft-${workspaceId}`;
    const [draft, setDraft] = useState(() => localStorage.getItem(draftKey) || '');

    // Persistent Webhook URL
    const webhookKey = `stackpad-slack-webhook-${workspaceId}`;
    const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem(webhookKey) || '');
    const [showSettings, setShowSettings] = useState(false);
    const [sendStatus, setSendStatus] = useState(null); // 'sending', 'success', 'error', null

    // Save draft automatically
    useEffect(() => {
        localStorage.setItem(draftKey, draft);
    }, [draft, draftKey]);

    // Save webhook URL automatically
    useEffect(() => {
        localStorage.setItem(webhookKey, webhookUrl);
    }, [webhookUrl, webhookKey]);

    const handleLaunchSlack = () => {
        window.location.href = 'slack://open';
    };

    const handleLaunchSatellite = () => {
        // Launches Slack in a vertical "sidecar" window
        const width = 500;
        const height = window.screen.height - 100;
        const left = window.screen.width - width;
        const top = 0;

        const win = window.open(
            'https://app.slack.com/client',
            'StackPadSatellite',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );

        if (!win || win.closed || typeof win.closed == 'undefined') {
            alert("🚨 Pop-up Blocked!\n\nPlease allow pop-ups for this site to use Satellite Mode. Look for the icon in your address bar.");
            return;
        }

        setSatelliteWindow(win);
    };

    const handleSendToWebhook = async () => {
        if (!webhookUrl || !draft.trim()) return;

        setSendStatus('sending');
        try {
            // Note: Use 'no-cors' mode if standard CORS fails, 
            // though this prevents reading the response status.
            // For many Slack webhooks, standard POST works if headers are omitted.
            await fetch(webhookUrl, {
                method: 'POST',
                body: JSON.stringify({ text: draft }),
            });

            // Assume success if no network error thrown
            setSendStatus('success');
            setTimeout(() => setSendStatus(null), 3000);

            // Optional: Clear draft after send? 
            // setDraft(''); 
        } catch (err) {
            console.error('Slack send error:', err);
            setSendStatus('error');
            setTimeout(() => setSendStatus(null), 3000);
        }
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
                        🚀 App
                    </button>
                    <button className="glass-button satellite-btn" onClick={handleLaunchSatellite} title="Launch in sidebar mode">
                        📱 Satellite Mode
                    </button>
                    <button
                        className={`glass-button icon-only ${showSettings ? 'active' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                        title="Connection Settings"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="slack-settings-panel">
                    <label>Incoming Webhook URL</label>
                    <input
                        type="password"
                        className="glass-input"
                        placeholder="https://hooks.slack.com/services/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <p className="settings-hint">
                        Paste a Webhook URL to enable sending direct messages from StackPad.
                    </p>
                </div>
            )}

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
                            <span>Mentions</span>
                        </a>
                        <a href="slack://open" className="quick-link">
                            <span className="link-icon">💾</span>
                            <span>Saved Items</span>
                        </a>
                        <a href="slack://open" className="quick-link">
                            <span className="link-icon">🔍</span>
                            <span>Search</span>
                        </a>
                    </div>
                </div>

                {/* Message Drafter */}
                <div className="message-drafter">
                    <div className="drafter-header">
                        <h3>📝 Message Drafter</h3>
                        <div className="drafter-actions">
                            <span className="save-status">✓ Auto-saved</span>
                        </div>
                    </div>

                    <div className="textarea-wrapper">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type your message here..."
                            className="draft-textarea glass-input"
                        />
                        <div className="draft-footer-actions">
                            <button className="copy-draft-btn" onClick={copyDraft} title="Copy to Clipboard">
                                📋 Copy
                            </button>

                            {webhookUrl && (
                                <button
                                    className={`send-btn ${sendStatus}`}
                                    onClick={handleSendToWebhook}
                                    disabled={!draft.trim() || sendStatus === 'sending'}
                                >
                                    {sendStatus === 'sending' ? 'Sending...' :
                                        sendStatus === 'success' ? '✓ Sent!' :
                                            sendStatus === 'error' ? '⚠ Error' : '➤ Send Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
