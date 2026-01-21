import { useState, useRef } from 'react';
import './StickyNotes.css';

const COLORS = [
    { id: 'yellow', bg: 'var(--sticky-yellow)', text: '#1a1a1a' },
    { id: 'orange', bg: 'var(--sticky-orange)', text: '#1a1a1a' },
    { id: 'pink', bg: 'var(--sticky-pink)', text: '#1a1a1a' },
    { id: 'blue', bg: 'var(--sticky-blue)', text: '#1a1a1a' },
    { id: 'green', bg: 'var(--sticky-green)', text: '#1a1a1a' },
];

const INITIAL_NOTES = [
    { id: 1, content: 'Remember to update the API docs 📚', color: 'yellow', x: 20, y: 20 },
    { id: 2, content: 'Fix the mobile nav z-index issue', color: 'pink', x: 220, y: 80 },
    { id: 3, content: 'Code review for PR #42', color: 'orange', x: 120, y: 180 },
];

export default function StickyNotes() {
    const [notes, setNotes] = useState(INITIAL_NOTES);
    const [activeNote, setActiveNote] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            content: '',
            color: COLORS[Math.floor(Math.random() * COLORS.length)].id,
            x: Math.random() * 100,
            y: Math.random() * 100,
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

        // Bring to front
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
                ? { ...note, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(80, y)) }
                : note
        ));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="sticky-notes">
            <div className="sticky-header">
                <h2 className="sticky-title">
                    <span className="title-icon">📌</span>
                    Sticky Notes
                </h2>
                <button className="add-sticky-btn glass-button" onClick={addNote}>
                    + Add Note
                </button>
            </div>

            <div
                ref={containerRef}
                className="sticky-board glass-card"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {notes.map((note, index) => {
                    const colorData = COLORS.find(c => c.id === note.color) || COLORS[0];
                    return (
                        <div
                            key={note.id}
                            className={`sticky-note ${activeNote === note.id ? 'active' : ''}`}
                            style={{
                                left: `${note.x}%`,
                                top: `${note.y}%`,
                                '--sticky-bg': colorData.bg,
                                '--sticky-text': colorData.text,
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
                            />
                        </div>
                    );
                })}

                {notes.length === 0 && (
                    <div className="empty-board">
                        <span className="empty-icon">📝</span>
                        <p>Click "Add Note" to create your first sticky!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
