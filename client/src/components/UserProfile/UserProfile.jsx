import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, closeProfileModal } from '../../redux/slices/userSlice';
import './UserProfile.css';

export default function UserProfile() {
    const dispatch = useDispatch();
    const { user, isProfileOpen } = useSelector((state) => state.user);
    const [formData, setFormData] = useState(user);

    if (!isProfileOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(formData));
        dispatch(closeProfileModal());
    };

    const handleClose = () => {
        dispatch(closeProfileModal());
        setFormData(user);
    };

    const avatarSeeds = ['developer', 'coder', 'hacker', 'ninja', 'wizard', 'robot', 'astronaut', 'pirate'];

    return (
        <div className="profile-overlay" onClick={handleClose}>
            <div className="profile-modal glass-card" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={handleClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="avatar-section">
                        <div className="current-avatar">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`}
                                alt="Avatar"
                            />
                        </div>
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
