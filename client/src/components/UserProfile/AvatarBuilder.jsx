/**
 * AvatarBuilder.jsx - Custom Avatar Creator
 * 
 * Allows users to either:
 * 1. Upload their own avatar image
 * 2. Build a custom avatar with various options
 * 
 * Uses DiceBear API with avataaars style which supports many customization options.
 */

import { useState, useRef } from 'react';
import './AvatarBuilder.css';

// Avatar customization options
const AVATAR_OPTIONS = {
    skinColor: [
        { id: 'light', label: '🏻', color: '#ffdbb4' },
        { id: 'pale', label: '🏻', color: '#edb98a' },
        { id: 'brown', label: '🏽', color: '#d08b5b' },
        { id: 'darkBrown', label: '🏾', color: '#ae5d29' },
        { id: 'black', label: '🏿', color: '#614335' },
    ],
    hair: [
        { id: 'shortHairShortFlat', label: 'Short Flat' },
        { id: 'shortHairShortWaved', label: 'Short Wavy' },
        { id: 'shortHairShortCurly', label: 'Short Curly' },
        { id: 'shortHairTheCaesar', label: 'Caesar' },
        { id: 'longHairStraight', label: 'Long Straight' },
        { id: 'longHairCurly', label: 'Long Curly' },
        { id: 'longHairBob', label: 'Bob' },
        { id: 'longHairBun', label: 'Bun' },
        { id: 'longHairMiaWallace', label: 'Mia Wallace' },
        { id: 'shortHairDreads01', label: 'Dreads' },
        { id: 'shortHairFrizzle', label: 'Frizzle' },
        { id: 'hatBeanie', label: 'Beanie 🧢' },
        { id: 'hijab', label: 'Hijab' },
        { id: 'turban', label: 'Turban' },
        { id: 'noHair', label: 'Bald' },
    ],
    hairColor: [
        { id: 'black', label: '⬛', color: '#2c1b18' },
        { id: 'brown', label: '🟫', color: '#724133' },
        { id: 'blonde', label: '🟨', color: '#b58143' },
        { id: 'red', label: '🟥', color: '#a55728' },
        { id: 'gray', label: '⬜', color: '#c9c9c9' },
        { id: 'platinum', label: '💎', color: '#ecdcbf' },
        { id: 'blue', label: '🔵', color: '#4a90d9' },
        { id: 'pink', label: '💗', color: '#ff69b4' },
        { id: 'purple', label: '💜', color: '#9b59b6' },
    ],
    eyes: [
        { id: 'default', label: 'Default' },
        { id: 'happy', label: 'Happy 😊' },
        { id: 'wink', label: 'Wink 😉' },
        { id: 'surprised', label: 'Surprised 😮' },
        { id: 'side', label: 'Side Eye' },
        { id: 'squint', label: 'Squint' },
        { id: 'hearts', label: 'Hearts 😍' },
        { id: 'dizzy', label: 'Dizzy' },
        { id: 'eyeRoll', label: 'Eye Roll 🙄' },
    ],
    eyebrows: [
        { id: 'default', label: 'Default' },
        { id: 'raised', label: 'Raised' },
        { id: 'angry', label: 'Angry 😠' },
        { id: 'sad', label: 'Sad' },
        { id: 'unibrow', label: 'Unibrow' },
        { id: 'upDown', label: 'Up Down' },
    ],
    mouth: [
        { id: 'default', label: 'Default' },
        { id: 'smile', label: 'Smile 😊' },
        { id: 'twinkle', label: 'Twinkle' },
        { id: 'serious', label: 'Serious 😐' },
        { id: 'tongue', label: 'Tongue 😛' },
        { id: 'scream', label: 'Scream 😱' },
        { id: 'sad', label: 'Sad 😢' },
    ],
    facialHair: [
        { id: '', label: 'None' },
        { id: 'beardLight', label: 'Light Beard' },
        { id: 'beardMedium', label: 'Medium Beard' },
        { id: 'beardMajestic', label: 'Majestic Beard' },
        { id: 'moustacheFancy', label: 'Fancy Mustache' },
        { id: 'moustacheMagnum', label: 'Magnum' },
    ],
    accessories: [
        { id: '', label: 'None' },
        { id: 'prescription01', label: 'Glasses 👓' },
        { id: 'prescription02', label: 'Round Glasses' },
        { id: 'sunglasses', label: 'Sunglasses 🕶️' },
        { id: 'wayfarers', label: 'Wayfarers' },
        { id: 'kurt', label: 'Kurt' },
    ],
    clothe: [
        { id: 'blazerShirt', label: 'Blazer' },
        { id: 'blazerSweater', label: 'Blazer + Sweater' },
        { id: 'collarSweater', label: 'Collar Sweater' },
        { id: 'hoodie', label: 'Hoodie 🧥' },
        { id: 'overall', label: 'Overall' },
        { id: 'shirtCrewNeck', label: 'T-Shirt' },
        { id: 'shirtVNeck', label: 'V-Neck' },
        { id: 'graphicShirt', label: 'Graphic Tee' },
    ],
    clotheColor: [
        { id: 'black', label: '⬛', color: '#262e33' },
        { id: 'blue01', label: '🔵', color: '#65c9ff' },
        { id: 'blue02', label: '💙', color: '#5199e4' },
        { id: 'gray01', label: '⬜', color: '#94d3a2' },
        { id: 'red', label: '🔴', color: '#ff5c5c' },
        { id: 'pink', label: '💗', color: '#ffafb9' },
        { id: 'pastelBlue', label: '🩵', color: '#b1e2ff' },
        { id: 'pastelYellow', label: '💛', color: '#ffffb1' },
    ],
};

// Categories for tab navigation
const CATEGORIES = [
    { id: 'skinColor', label: '👤', title: 'Skin' },
    { id: 'hair', label: '💇', title: 'Hair' },
    { id: 'hairColor', label: '🎨', title: 'Hair Color' },
    { id: 'eyes', label: '👁️', title: 'Eyes' },
    { id: 'eyebrows', label: '🤨', title: 'Eyebrows' },
    { id: 'mouth', label: '👄', title: 'Mouth' },
    { id: 'facialHair', label: '🧔', title: 'Facial Hair' },
    { id: 'accessories', label: '👓', title: 'Accessories' },
    { id: 'clothe', label: '👕', title: 'Clothes' },
    { id: 'clotheColor', label: '🌈', title: 'Clothes Color' },
];

export default function AvatarBuilder({ currentAvatar, onSave, onCancel }) {
    const fileInputRef = useRef(null);

    // Avatar mode: 'build' or 'upload'
    const [mode, setMode] = useState(currentAvatar?.type === 'upload' ? 'upload' : 'build');

    // Uploaded image data URL
    const [uploadedImage, setUploadedImage] = useState(currentAvatar?.uploadedImage || null);

    // Current active category tab
    const [activeCategory, setActiveCategory] = useState('skinColor');

    // Avatar customization selections
    const [selections, setSelections] = useState(currentAvatar?.selections || {
        skinColor: 'light',
        hair: 'shortHairShortFlat',
        hairColor: 'brown',
        eyes: 'default',
        eyebrows: 'default',
        mouth: 'smile',
        facialHair: '',
        accessories: '',
        clothe: 'hoodie',
        clotheColor: 'blue01',
    });

    // Build DiceBear URL from selections
    // DiceBear 7.x uses array syntax: param[]=value
    const buildAvatarUrl = () => {
        const params = [];

        // Fixed seed for consistent base avatar
        params.push('seed=myavatar');

        // Skin color - must be hex without #
        const skinColors = {
            'light': 'ffdbb4',
            'pale': 'edb98a',
            'brown': 'd08b5b',
            'darkBrown': 'ae5d29',
            'black': '614335',
        };
        if (selections.skinColor && skinColors[selections.skinColor]) {
            params.push(`skinColor=${skinColors[selections.skinColor]}`);
        }

        // Hair/Top style
        if (selections.hair) {
            params.push(`top=${selections.hair}`);
        }

        // Hair color - hex without #
        const hairColors = {
            'black': '2c1b18',
            'brown': '724133',
            'blonde': 'b58143',
            'red': 'a55728',
            'gray': 'c9c9c9',
            'platinum': 'ecdcbf',
            'blue': '4a90d9',
            'pink': 'ff69b4',
            'purple': '9b59b6'
        };
        if (selections.hairColor && hairColors[selections.hairColor]) {
            params.push(`hairColor=${hairColors[selections.hairColor]}`);
        }

        // Eyes
        if (selections.eyes) {
            params.push(`eyes=${selections.eyes}`);
        }

        // Eyebrows  
        const eyebrowTypes = {
            'default': 'default',
            'raised': 'raisedExcited',
            'angry': 'angry',
            'sad': 'sadConcerned',
            'unibrow': 'unibrowNatural',
            'upDown': 'upDown'
        };
        if (selections.eyebrows && eyebrowTypes[selections.eyebrows]) {
            params.push(`eyebrows=${eyebrowTypes[selections.eyebrows]}`);
        }

        // Mouth
        if (selections.mouth) {
            params.push(`mouth=${selections.mouth}`);
        }

        // Facial hair
        if (selections.facialHair) {
            params.push(`facialHair=${selections.facialHair}`);
        }

        // Accessories
        if (selections.accessories) {
            params.push(`accessories=${selections.accessories}`);
        }

        // Clothes
        if (selections.clothe) {
            params.push(`clothing=${selections.clothe}`);
        }

        // Clothes color - hex without #
        const clotheColors = {
            'black': '262e33',
            'blue01': '65c9ff',
            'blue02': '5199e4',
            'gray01': '929598',
            'red': 'ff5c5c',
            'pink': 'ffafb9',
            'pastelBlue': 'b1e2ff',
            'pastelYellow': 'ffffb1'
        };
        if (selections.clotheColor && clotheColors[selections.clotheColor]) {
            params.push(`clothingColor=${clotheColors[selections.clotheColor]}`);
        }

        return `https://api.dicebear.com/7.x/avataaars/svg?${params.join('&')}`;
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target.result);
            setMode('upload');
        };
        reader.readAsDataURL(file);
    };

    // Handle selection change
    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    // Save avatar
    const handleSave = () => {
        if (mode === 'upload' && uploadedImage) {
            onSave({
                type: 'upload',
                uploadedImage: uploadedImage,
                url: uploadedImage,
            });
        } else {
            onSave({
                type: 'build',
                selections: selections,
                url: buildAvatarUrl(),
            });
        }
    };

    // Randomize avatar
    const randomize = () => {
        const newSelections = {};
        Object.keys(AVATAR_OPTIONS).forEach(key => {
            const options = AVATAR_OPTIONS[key];
            const randomIndex = Math.floor(Math.random() * options.length);
            newSelections[key] = options[randomIndex].id;
        });
        setSelections(newSelections);
    };

    return (
        <div className="avatar-builder">
            {/* Mode Toggle */}
            <div className="builder-mode-toggle">
                <button
                    className={`mode-btn ${mode === 'build' ? 'active' : ''}`}
                    onClick={() => setMode('build')}
                >
                    🎨 Build Avatar
                </button>
                <button
                    className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    📷 Upload Photo
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Avatar Preview */}
            <div className="avatar-preview-large">
                <img
                    src={mode === 'upload' && uploadedImage ? uploadedImage : buildAvatarUrl()}
                    alt="Avatar Preview"
                />
            </div>

            {mode === 'build' && (
                <>
                    {/* Randomize Button */}
                    <button className="randomize-btn" onClick={randomize}>
                        🎲 Randomize
                    </button>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                title={cat.title}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Options Grid */}
                    <div className="options-container">
                        <h4 className="options-title">
                            {CATEGORIES.find(c => c.id === activeCategory)?.title}
                        </h4>
                        <div className="options-grid">
                            {AVATAR_OPTIONS[activeCategory]?.map(option => (
                                <button
                                    key={option.id}
                                    className={`option-btn ${selections[activeCategory] === option.id ? 'active' : ''}`}
                                    onClick={() => handleSelect(activeCategory, option.id)}
                                    style={option.color ? { backgroundColor: option.color } : {}}
                                >
                                    {option.color ? '' : option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {mode === 'upload' && uploadedImage && (
                <div className="upload-info">
                    <p>✅ Image uploaded successfully!</p>
                    <button
                        className="change-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Change Image
                    </button>
                </div>
            )}

            {/* Action Buttons */}
            <div className="builder-actions">
                <button className="glass-button" onClick={onCancel}>
                    Cancel
                </button>
                <button className="glass-button primary" onClick={handleSave}>
                    Save Avatar
                </button>
            </div>
        </div>
    );
}
