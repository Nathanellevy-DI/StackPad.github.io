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

    // Storage keys per workspace
    const draftKey = `stackpad_slack_draft_${workspaceId}`;
    const webhookKey = `stackpad_slack_webhook_${workspaceId}`;

    // State declarations
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [draft, setDraft] = useState(() => localStorage.getItem(draftKey) || '');
    const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem(webhookKey) || '');
    const [sendStatus, setSendStatus] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Save draft automatically
    useEffect(() => {
        localStorage.setItem(draftKey, draft);
    }, [draft, draftKey]);

    // Save webhook URL automatically
    useEffect(() => {
        localStorage.setItem(webhookKey, webhookUrl);
    }, [webhookUrl, webhookKey]);

    // Handle outside click to close drawer
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isDrawerOpen && !e.target.closest('.slack-drawer') && !e.target.closest('.satellite-btn')) {
                setIsDrawerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDrawerOpen]);

    const handleLaunchSlack = () => {
        window.location.href = 'slack://open';
    };

    const handleSendToWebhook = async () => {
        if (!webhookUrl || !draft.trim()) return;

        setSendStatus('sending');
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                body: JSON.stringify({ text: draft }),
            });
            setSendStatus('success');
            setTimeout(() => setSendStatus(null), 3000);
        } catch (err) {
            console.error('Slack send error:', err);
            setSendStatus('error');
            setTimeout(() => setSendStatus(null), 3000);
        }
    };

    const copyDraft = () => {
        navigator.clipboard.writeText(draft);
    };

    // Components for the drawer content to avoid duplication
    const DrawerContent = () => (
        <div className="drawer-inner">
            <div className="drawer-header">
                <h3>Slack Quick View</h3>
                <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>×</button>
            </div>

            <div className="drawer-section">
                <h4>📨 Message Drafter</h4>
                <div className="textarea-wrapper">
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type your message..."
                        className="draft-textarea glass-input"
                    />
                    <div className="draft-footer-actions">
                        <button className="copy-draft-btn" onClick={copyDraft} title="Copy">
                            📋
                        </button>
                        {webhookUrl && (
                            <button
                                className={`send-btn ${sendStatus}`}
                                onClick={handleSendToWebhook}
                                disabled={!draft.trim() || sendStatus === 'sending'}
                            >
                                {sendStatus === 'sending' ? '...' :
                                    sendStatus === 'success' ? '✓' :
                                        sendStatus === 'error' ? '⚠' : '➤'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="drawer-section">
                <h4>🔗 Quick Links</h4>
                <div className="quick-links-list">
                    <a href="slack://open" className="drawer-link">💬 DMs</a>
                    <a href="slack://open" className="drawer-link">📢 Mentions</a>
                    <a href="slack://open" className="drawer-link">💾 Saved</a>
                </div>
            </div>
        </div>
    );

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
                    <button
                        className={`glass-button satellite-btn ${isDrawerOpen ? 'active' : ''}`}
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        title="Toggle Sidebar Drawer"
                    >
                        📱 Toggle Sidebar
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
                {/* Message Drafter (Main View) */}
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

            {/* Sliding Drawer */}
            <div className={`slack-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <DrawerContent />
            </div>
        </div>
    );
}
