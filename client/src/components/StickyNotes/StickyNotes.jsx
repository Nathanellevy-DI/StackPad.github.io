import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentWorkspace, updateNotes } from '../../redux/slices/workspaceSlice';
import './StickyNotes.css';

const COLORS = [
    { id: 'yellow', bg: '#fef9c3', text: '#1a1a1a' },
    { id: 'orange', bg: '#fed7aa', text: '#1a1a1a' },
    { id: 'pink', bg: '#fecdd3', text: '#1a1a1a' },
    { id: 'blue', bg: '#bfdbfe', text: '#1a1a1a' },
    { id: 'green', bg: '#bbf7d0', text: '#1a1a1a' },
];

const SIZES = [
    { id: 'small', width: 150, height: 120, label: 'S' },
    { id: 'medium', width: 200, height: 180, label: 'M' },
    { id: 'large', width: 280, height: 240, label: 'L' },
];

export default function StickyNotes() {
    const dispatch = useDispatch();
    const workspace = useSelector(selectCurrentWorkspace);
    const savedNotes = workspace?.notes || [];

    const [notes, setNotes] = useState(savedNotes.length > 0 ? savedNotes : [
        { id: 1, content: 'Welcome to StackPad! 📚', color: 'yellow', size: 'medium', x: 3, y: 5 },
        { id: 2, content: 'Drag me around!', color: 'pink', size: 'medium', x: 20, y: 8 },
    ]);
    const [activeNote, setActiveNote] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Sync with Redux when workspace changes
    useEffect(() => {
        if (savedNotes.length > 0) {
            setNotes(savedNotes);
        }
    }, [workspace?.id]);

    // Save to Redux whenever notes change
    useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(updateNotes(notes));
        }, 500);
        return () => clearTimeout(timeout);
    }, [notes, dispatch]);

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            content: '',
            color: COLORS[Math.floor(Math.random() * COLORS.length)].id,
            size: 'medium',
            x: 5 + Math.random() * 20,
            y: 5 + Math.random() * 15,
        };
        setNotes([...notes, newNote]);
        setActiveNote(newNote.id);
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

    const handleMouseDown = (e, id) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.closest('.sticky-actions')) return;

        setActiveNote(id);
        setIsDragging(true);

        const note = notes.find(n => n.id === id);
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - (note.x / 100 * rect.width),
            y: e.clientY - (note.y / 100 * rect.height),
        };

        setNotes(prev => {
            const filtered = prev.filter(n => n.id !== id);
            return [...filtered, prev.find(n => n.id === id)];
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !activeNote) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y) / rect.height) * 100;

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
                                zIndex: index + 1,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, note.id)}
                        >
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
