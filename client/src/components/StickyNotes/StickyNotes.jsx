/**
 * StickyNotes.jsx - Draggable Sticky Notes Component
 * 
 * A kanban-like board where users can create, edit, drag, and resize sticky notes.
 * Notes are persistent and isolated per workspace.
 * 
 * Features:
 * - Create new notes
 * - Drag and drop positioning (limited to container bounds)
 * - Color customization (Yellow, Orange, Pink, Blue, Green)
 * - Size customization (Small, Medium, Large)
 * - Auto-save to Redux/localStorage
 * - Delete notes
 * 
 * Technical Implementation:
 * - Uses absolute positioning with % coordinates for responsiveness
 * - Custom drag-and-drop logic (mouseDown, mouseMove, mouseUp)
 * - Prevents dragging when editing text or clicking actions
 */

import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentWorkspace, updateNotes } from '../../redux/slices/workspaceSlice';
import './StickyNotes.css';

// Predefined colors for the notes
const COLORS = [
    { id: 'yellow', bg: '#fef9c3', text: '#1a1a1a' },
    { id: 'orange', bg: '#fed7aa', text: '#1a1a1a' },
    { id: 'pink', bg: '#fecdd3', text: '#1a1a1a' },
    { id: 'blue', bg: '#bfdbfe', text: '#1a1a1a' },
    { id: 'green', bg: '#bbf7d0', text: '#1a1a1a' },
];

// Available note sizes
const SIZES = [
    { id: 'small', width: 150, height: 120, label: 'S' },
    { id: 'medium', width: 200, height: 180, label: 'M' },
    { id: 'large', width: 280, height: 240, label: 'L' },
];

export default function StickyNotes() {
    const dispatch = useDispatch();
    const workspace = useSelector(selectCurrentWorkspace);

    // Load notes from current workspace data
    const savedNotes = workspace?.notes || [];

    // Initialize state with saved notes or default intro notes
    const [notes, setNotes] = useState(savedNotes.length > 0 ? savedNotes : [
        { id: 1, content: 'Welcome to StackPad! 📚', color: 'yellow', size: 'medium', x: 3, y: 5 },
        { id: 2, content: 'Drag me around!', color: 'pink', size: 'medium', x: 20, y: 8 },
    ]);

    // Drag data
    const [activeNote, setActiveNote] = useState(null);  // Currently selected/dragged note ID
    const [isDragging, setIsDragging] = useState(false);

    // Refs for DOM manipulation
    const containerRef = useRef(null);        // The board container
    const dragOffset = useRef({ x: 0, y: 0 }); // Mouse offset relative to note top-left corner

    // Sync state when workspace ID changes (loading different workspace's notes)
    useEffect(() => {
        if (savedNotes.length > 0) {
            setNotes(savedNotes);
        }
    }, [workspace?.id]);

    // Save to Redux whenever notes state changes (debounced by 500ms)
    // This prevents excessive writes during dragging/typing
    useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(updateNotes(notes));
        }, 500);
        return () => clearTimeout(timeout);
    }, [notes, dispatch]);

    // Add a new note at a random position near top-left
    const addNote = () => {
        const newNote = {
            id: Date.now(),
            content: '',
            color: COLORS[Math.floor(Math.random() * COLORS.length)].id, // Random color
            size: 'medium',
            x: 5 + Math.random() * 20, // Randomish start position
            y: 5 + Math.random() * 15,
        };
        setNotes([...notes, newNote]);
        setActiveNote(newNote.id); // Select new note
    };

    const updateNote = (id, content) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, content } : note
        ));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
        if (activeNote === id) setActiveNote(null);
    };

    const changeColor = (id, color) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, color } : note
        ));
    };

    const changeSize = (id, size) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, size } : note
        ));
    };

    // ============================================
    // DRAG AND DROP LOGIC
    // ============================================

    const handleMouseDown = (e, id) => {
        // Prevent dragging if clicking input area or buttons
        if (e.target.tagName === 'TEXTAREA' || e.target.closest('.sticky-actions')) return;

        setActiveNote(id);
        setIsDragging(true);

        // Calculate offset (where mouse grasped the note)
        // Stored as percentage of container dimensions
        const note = notes.find(n => n.id === id);
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - (note.x / 100 * rect.width),
            y: e.clientY - (note.y / 100 * rect.height),
        };

        // Move active note to end of array so it renders on top (z-index)
        setNotes(prev => {
            const filtered = prev.filter(n => n.id !== id);
            return [...filtered, prev.find(n => n.id === id)];
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !activeNote) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Calculate new X/Y based on mouse diff
        const x = ((e.clientX - dragOffset.current.x) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y) / rect.height) * 100;

        // Apply new position with boundary constraints (0-80% width, 0-75% height)
        setNotes(notes.map(note =>
            note.id === activeNote
                ? { ...note, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(75, y)) }
                : note
        ));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="sticky-notes full-height">
            {/* Header */}
            <div className="sticky-header">
                <h2 className="sticky-title">
                    <span className="title-icon">📌</span>
                    Sticky Notes
                    <span className="saved-indicator">✓ Auto-saved</span>
                </h2>
                <button className="glass-button primary add-note-btn" onClick={addNote}>
                    + New Note
                </button>
            </div>

            {/* Board Container - Drop Area */}
            <div
                ref={containerRef}
                className="sticky-board"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {notes.map((note, index) => {
                    const colorData = COLORS.find(c => c.id === note.color) || COLORS[0];
                    const sizeData = SIZES.find(s => s.id === note.size) || SIZES[1];

                    return (
                        <div
                            key={note.id}
                            className={`sticky-note ${activeNote === note.id ? 'active' : ''}`}
                            style={{
                                left: `${note.x}%`,
                                top: `${note.y}%`,
                                backgroundColor: colorData.bg,
                                color: colorData.text,
                                width: `${sizeData.width}px`,
                                minHeight: `${sizeData.height}px`,
                                zIndex: index + 1, // Render order determines layer stack
                            }}
                            onMouseDown={(e) => handleMouseDown(e, note.id)}
                        >
                            {/* Note Controls (Color, Size, Delete) */}
                            <div className="sticky-actions">
                                <div className="color-dots">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.id}
                                            className={`color-dot ${note.color === c.id ? 'active' : ''}`}
                                            style={{ background: c.bg }}
                                            onClick={() => changeColor(note.id, c.id)}
                                        />
                                    ))}
                                </div>
                                <div className="size-btns">
                                    {SIZES.map(s => (
                                        <button
                                            key={s.id}
                                            className={`size-btn ${note.size === s.id ? 'active' : ''}`}
                                            onClick={() => changeSize(note.id, s.id)}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="delete-sticky"
                                    onClick={() => deleteNote(note.id)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Text Input Area */}
                            <textarea
                                className="sticky-content"
                                value={note.content}
                                onChange={(e) => updateNote(note.id, e.target.value)}
                                placeholder="Write something..."
                                onClick={() => setActiveNote(note.id)}
                                style={{ minHeight: `${sizeData.height - 50}px` }}
                            />
                        </div>
                    );
                })}

                {/* Empty State */}
                {notes.length === 0 && (
                    <div className="empty-board">
                        <span className="empty-icon">📝</span>
                        <p>Click "New Note" to create your first sticky!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
