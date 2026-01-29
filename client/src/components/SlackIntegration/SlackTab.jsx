/**
 * SlackTab.jsx - Slack Integration Hub
 * 
 * A dedicated tab for Slack communication. 
 * Since embedding Slack directly is blocked by security policies (X-Frame-Options),
 * this component acts as a bridge and productivity tool.
 * 
 * Features:
 * - Quick Launch: Deep links to open Slack app directly
 * - Satellite Mode: Launches an in-app draggable floating hub
 * - Message Drafting: Persistent scratchpad for composing messages
 * - Webhook Integration: Send messages directly to a channel
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import DraggableSatellite from './DraggableSatellite';
import './SlackTab.css';

export default function SlackTab() {
    const workspace = useSelector(selectCurrentWorkspace);
    const workspaceId = workspace?.id || 'default';

    // Storage keys per workspace
    const draftKey = `stackpad_slack_draft_${workspaceId}`;
    const webhookKey = `stackpad_slack_webhook_${workspaceId}`;

    // State declarations
    const [draft, setDraft] = useState(() => localStorage.getItem(draftKey) || '');
    const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem(webhookKey) || '');
    const [sendStatus, setSendStatus] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Satellite State
    const [showSatellite, setShowSatellite] = useState(false);

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

    // State for tone transformation
    const [isTransforming, setIsTransforming] = useState(false);

    // Tone transformation functions (algorithmic "AI")
    const transformTone = (text, tone) => {
        if (!text.trim()) return text;

        // Clean up the text first
        let result = text.trim();

        switch (tone) {
            case 'professional':
                // Add formal greetings, proper punctuation, business language
                result = result
                    .replace(/hey|hi|yo/gi, 'Hello')
                    .replace(/thanks|thx|ty/gi, 'Thank you')
                    .replace(/gonna/gi, 'going to')
                    .replace(/wanna/gi, 'want to')
                    .replace(/gotta/gi, 'have to')
                    .replace(/u\b/gi, 'you')
                    .replace(/ur\b/gi, 'your')
                    .replace(/pls|plz/gi, 'please')
                    .replace(/asap/gi, 'at your earliest convenience')
                    .replace(/btw/gi, 'Additionally,')
                    .replace(/fyi/gi, 'For your information,')
                    .replace(/lmk/gi, 'please let me know')
                    .replace(/\!+/g, '.');
                // Capitalize first letter of sentences
                result = result.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
                if (!result.endsWith('.') && !result.endsWith('?') && !result.endsWith('!')) {
                    result += '.';
                }
                result = 'Dear Team,\n\n' + result + '\n\nBest regards';
                break;

            case 'casual':
                // Make it friendly and relaxed
                result = result
                    .replace(/Hello|Dear/gi, 'Hey')
                    .replace(/Thank you/gi, 'Thanks')
                    .replace(/Best regards|Sincerely|Regards/gi, 'Cheers!')
                    .replace(/at your earliest convenience/gi, 'ASAP')
                    .replace(/Additionally,/gi, 'btw')
                    .replace(/For your information,/gi, 'fyi')
                    .replace(/please let me know/gi, 'lmk')
                    .replace(/\.\s*$/g, '!')
                    .replace(/Dear Team,\n\n/gi, '');
                if (!result.startsWith('Hey')) {
                    result = 'Hey! ' + result;
                }
                break;

            case 'sales':
                // Add enthusiasm, urgency, and value propositions
                result = result
                    .replace(/good/gi, 'amazing')
                    .replace(/nice/gi, 'incredible')
                    .replace(/help/gi, 'empower')
                    .replace(/buy/gi, 'invest in')
                    .replace(/cost/gi, 'investment')
                    .replace(/cheap/gi, 'cost-effective')
                    .replace(/problem/gi, 'challenge')
                    .replace(/\./g, '!');
                result = '🚀 ' + result + '\n\n✨ Don\'t miss this opportunity! Ready to take the next step?';
                break;

            case 'friendly':
                // Warm and personal
                result = result
                    .replace(/Hello/gi, 'Hi there')
                    .replace(/Thank you/gi, 'Thanks so much')
                    .replace(/Best regards/gi, 'Take care!')
                    .replace(/Sincerely/gi, 'Warmly,');
                // Add emoji based on content
                if (result.includes('thank') || result.includes('Thanks')) {
                    result = result.replace(/thanks/gi, 'thanks 🙏');
                }
                if (!result.includes('😊') && !result.includes('🙏')) {
                    result += ' 😊';
                }
                result = 'Hi there! 👋\n\n' + result;
                break;

            default:
                break;
        }

        return result;
    };

    const handleToneTransform = (tone) => {
        if (!draft.trim()) return;
        setIsTransforming(true);

        // Simulate "AI thinking" delay
        setTimeout(() => {
            const transformed = transformTone(draft, tone);
            setDraft(transformed);
            setIsTransforming(false);
        }, 600);
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
                    <button
                        className={`glass-button satellite-btn ${showSatellite ? 'active' : ''}`}
                        onClick={() => setShowSatellite(!showSatellite)}
                        title="Toggle Satellite Widget"
                    >
                        📡 Satellite Mode
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

            {/* Configured Settings Panel */}
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

                    {/* AI Tone Buttons */}
                    <div className="tone-buttons">
                        <span className="tone-label">✨ Tone:</span>
                        <button
                            className="tone-btn professional"
                            onClick={() => handleToneTransform('professional')}
                            disabled={isTransforming || !draft.trim()}
                        >
                            💼 Professional
                        </button>
                        <button
                            className="tone-btn casual"
                            onClick={() => handleToneTransform('casual')}
                            disabled={isTransforming || !draft.trim()}
                        >
                            😎 Casual
                        </button>
                        <button
                            className="tone-btn sales"
                            onClick={() => handleToneTransform('sales')}
                            disabled={isTransforming || !draft.trim()}
                        >
                            🚀 Sales Pitch
                        </button>
                        <button
                            className="tone-btn friendly"
                            onClick={() => handleToneTransform('friendly')}
                            disabled={isTransforming || !draft.trim()}
                        >
                            🤗 Friendly
                        </button>
                        {isTransforming && <span className="transforming">✨ Transforming...</span>}
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

            {/* Draggable Satellite Widget */}
            {showSatellite && (
                <DraggableSatellite
                    onClose={() => setShowSatellite(false)}
                    initialContent={draft}
                />
            )}
        </div>
    );
}
