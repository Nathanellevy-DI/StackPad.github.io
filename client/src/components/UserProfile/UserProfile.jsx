/**
 * UserProfile.jsx - User Profile Edit Modal
 * 
 * A modal dialog for editing user profile information.
 * Opens when clicking the avatar in the Header.
 * 
 * Editable fields:
 * - Avatar (selecting from preset options via DiceBear API)
 * - Display Name
 * - LinkedIn URL (for the header social link)
 * - Email (optional)
 * 
 * The modal closes by:
 * - Clicking outside the modal (overlay)
 * - Clicking the X button
 * - Clicking Cancel
 * - Saving changes
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, closeProfileModal } from '../../redux/slices/userSlice';
import './UserProfile.css';

export default function UserProfile() {
    const dispatch = useDispatch();

    // Get user data and modal state from Redux
    const { user, isProfileOpen } = useSelector((state) => state.user);

    // Local form state (initialized with current user data)
    const [formData, setFormData] = useState(user);

    // Don't render anything if modal is closed
    if (!isProfileOpen) return null;

    /**
     * handleSubmit - Saves the profile changes
     * Dispatches updateUser action and closes modal
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(formData));
        dispatch(closeProfileModal());
    };

    /**
     * handleClose - Closes modal without saving
     * Resets form data to original values
     */
    const handleClose = () => {
        dispatch(closeProfileModal());
        setFormData(user);  // Reset to original values
    };

    // Available avatar options using DiceBear seed strings
    // Each seed generates a unique avatar image
    const avatarSeeds = ['developer', 'coder', 'hacker', 'ninja', 'wizard', 'robot', 'astronaut', 'pirate'];

    return (
        // Overlay - clicking it closes the modal
        <div className="profile-overlay" onClick={handleClose}>
            {/* Modal content - stopPropagation prevents clicks from closing */}
            <div className="profile-modal glass-card" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="profile-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={handleClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ====== AVATAR SELECTION ====== */}
                    <div className="avatar-section">
                        {/* Current selected avatar (large) */}
                        <div className="current-avatar">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`}
                                alt="Avatar"
                            />
                        </div>

                        {/* Avatar options grid */}
                        <div className="avatar-options">
                            <p>Choose Avatar:</p>
                            <div className="avatar-grid">
                                {avatarSeeds.map((seed) => (
                                    <button
                                        key={seed}
                                        type="button"
                                        className={`avatar-option ${formData.avatarSeed === seed ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, avatarSeed: seed })}
                                    >
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                            alt={seed}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ====== DISPLAY NAME FIELD ====== */}
                    <div className="form-group">
                        <label htmlFor="name">Display Name</label>
                        <input
                            type="text"
                            id="name"
                            className="glass-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name"
                        />
                    </div>

                    {/* ====== LINKEDIN URL FIELD ====== */}
                    <div className="form-group">
                        <label htmlFor="linkedinUrl">LinkedIn URL</label>
                        <input
                            type="url"
                            id="linkedinUrl"
                            className="glass-input"
                            value={formData.linkedinUrl || ''}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            placeholder="https://linkedin.com/in/your-profile"
                        />
                    </div>

                    {/* ====== EMAIL FIELD (Optional) ====== */}
                    <div className="form-group">
                        <label htmlFor="email">Email (optional)</label>
                        <input
                            type="email"
                            id="email"
                            className="glass-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                        />
                    </div>

                    {/* ====== ACTION BUTTONS ====== */}
                    <div className="profile-actions">
                        <button type="button" className="glass-button" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="glass-button primary">
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
