/**
 * SlackDrafter.jsx - Reusable Slack Message Drafter Widget
 * 
 * A compact version of the message drafter with AI tone buttons.
 * Can be used on the dashboard or anywhere else in the app.
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './SlackDrafter.css';

export default function SlackDrafter() {
    const workspace = useSelector(selectCurrentWorkspace);
    const workspaceId = workspace?.id || 'default';

    // Storage key - shared with SlackTab
    const draftKey = `stackpad_slack_draft_${workspaceId}`;

    // State
    const [draft, setDraft] = useState(() => localStorage.getItem(draftKey) || '');
    const [isTransforming, setIsTransforming] = useState(false);
    const [copied, setCopied] = useState(false);

    // Save draft automatically
    useEffect(() => {
        localStorage.setItem(draftKey, draft);
    }, [draft, draftKey]);

    // Tone transformation functions
    const transformTone = (text, tone) => {
        if (!text.trim()) return text;

        let result = text.trim();

        switch (tone) {
            case 'professional':
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
                result = result.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
                if (!result.endsWith('.') && !result.endsWith('?') && !result.endsWith('!')) {
                    result += '.';
                }
                result = 'Dear Team,\n\n' + result + '\n\nBest regards';
                break;

            case 'casual':
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
                result = result
                    .replace(/good/gi, 'amazing')
                    .replace(/nice/gi, 'incredible')
                    .replace(/help/gi, 'empower')
                    .replace(/buy/gi, 'invest in')
                    .replace(/cost/gi, 'investment')
                    .replace(/cheap/gi, 'cost-effective')
                    .replace(/problem/gi, 'challenge')
                    .replace(/\./g, '!');
                result = '🚀 ' + result + '\n\n✨ Don\'t miss this opportunity!';
                break;

            case 'friendly':
                result = result
                    .replace(/Hello/gi, 'Hi there')
                    .replace(/Thank you/gi, 'Thanks so much')
                    .replace(/Best regards/gi, 'Take care!')
                    .replace(/Sincerely/gi, 'Warmly,');
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

        setTimeout(() => {
            const transformed = transformTone(draft, tone);
            setDraft(transformed);
            setIsTransforming(false);
        }, 500);
    };

    const copyDraft = () => {
        navigator.clipboard.writeText(draft);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearDraft = () => {
        setDraft('');
    };

    return (
        <div className="slack-drafter glass-card">
            <div className="drafter-header">
                <div className="drafter-title">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
                        alt="Slack"
                        className="slack-icon"
                    />
                    <h3>Quick Draft</h3>
                </div>
                <span className="auto-save">✓ Synced</span>
            </div>

            {/* Tone Buttons */}
            <div className="tone-row">
                <button
                    className="tone-chip professional"
                    onClick={() => handleToneTransform('professional')}
                    disabled={isTransforming || !draft.trim()}
                    title="Professional"
                >
                    💼
                </button>
                <button
                    className="tone-chip casual"
                    onClick={() => handleToneTransform('casual')}
                    disabled={isTransforming || !draft.trim()}
                    title="Casual"
                >
                    😎
                </button>
                <button
                    className="tone-chip sales"
                    onClick={() => handleToneTransform('sales')}
                    disabled={isTransforming || !draft.trim()}
                    title="Sales Pitch"
                >
                    🚀
                </button>
                <button
                    className="tone-chip friendly"
                    onClick={() => handleToneTransform('friendly')}
                    disabled={isTransforming || !draft.trim()}
                    title="Friendly"
                >
                    🤗
                </button>
                {isTransforming && <span className="transforming-mini">✨</span>}
            </div>

            <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Draft a message..."
                className="draft-input glass-input"
            />

            <div className="drafter-footer">
                <button
                    className="action-btn clear"
                    onClick={clearDraft}
                    disabled={!draft.trim()}
                >
                    🗑️
                </button>
                <button
                    className="action-btn copy"
                    onClick={copyDraft}
                    disabled={!draft.trim()}
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>
        </div>
    );
}
