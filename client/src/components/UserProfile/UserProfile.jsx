/**
 * UserProfile.jsx - User Profile Edit Modal
 * 
 * A modal dialog for editing user profile information.
 * Opens when clicking the avatar in the Header.
 * 
 * Features:
 * - Custom avatar builder with face, hair, accessories
 * - Upload your own avatar image
 * - Display Name, LinkedIn URL, Email fields
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, closeProfileModal } from '../../redux/slices/userSlice';
import AvatarBuilder from './AvatarBuilder';
import './UserProfile.css';

export default function UserProfile() {
    const dispatch = useDispatch();

    // Get user data and modal state from Redux
    const { user, isProfileOpen } = useSelector((state) => state.user);

    // Local form state (initialized with current user data)
    const [formData, setFormData] = useState(user);

    // Avatar builder modal state
    const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);

    // Don't render anything if modal is closed
    if (!isProfileOpen) return null;

    /**
     * handleSubmit - Saves the profile changes
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(formData));
        dispatch(closeProfileModal());
    };

    /**
     * handleClose - Closes modal without saving
     */
    const handleClose = () => {
        dispatch(closeProfileModal());
        setFormData(user);
        setShowAvatarBuilder(false);
    };

    /**
     * handleAvatarSave - Saves avatar from builder
     */
    const handleAvatarSave = (avatarData) => {
        setFormData(prev => ({ ...prev, avatar: avatarData }));
        setShowAvatarBuilder(false);
    };

    /**
     * getAvatarUrl - Returns current avatar URL
     */
    const getAvatarUrl = () => {
        if (formData.avatar?.url) {
            return formData.avatar.url;
        }
        // Fallback to old avatarSeed format
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed || 'developer'}`;
    };

    return (
        <div className="profile-overlay" onClick={handleClose}>
            <div className="profile-modal glass-card" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="profile-header">
                    <h2>{showAvatarBuilder ? 'Customize Avatar' : 'Edit Profile'}</h2>
                    <button className="close-btn" onClick={handleClose}>✕</button>
                </div>

                {showAvatarBuilder ? (
                    /* Avatar Builder View */
                    <AvatarBuilder
                        currentAvatar={formData.avatar}
                        onSave={handleAvatarSave}
                        onCancel={() => setShowAvatarBuilder(false)}
                    />
                ) : (
                    /* Profile Form View */
                    <form onSubmit={handleSubmit}>
                        {/* Avatar Section */}
                        <div className="avatar-section">
                            <div className="current-avatar clickable" onClick={() => setShowAvatarBuilder(true)}>
                                <img src={getAvatarUrl()} alt="Avatar" />
                                <div className="avatar-edit-overlay">
                                    <span>✏️</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="edit-avatar-btn"
                                onClick={() => setShowAvatarBuilder(true)}
                            >
                                🎨 Customize Avatar
                            </button>
                        </div>

                        {/* Display Name */}
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

                        {/* LinkedIn URL */}
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

                        {/* Email */}
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

                        {/* Action Buttons */}
                        <div className="profile-actions">
                            <button type="button" className="glass-button" onClick={handleClose}>
                                Cancel
                            </button>
                            <button type="submit" className="glass-button primary">
                                Save Profile
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
