/**
 * TodoList.jsx - Task Management Component
 * 
 * A simple but powerful to-do list for managing tasks.
 * Each workspace has its own separate todo list (stored by workspace ID).
 * 
 * Features:
 * - Add new tasks
 * - Mark tasks as complete
 * - Set priority levels (Low, Normal, High)
 * - Filter by: All, Active, Completed
 * - Clear all completed tasks with one click
 * - Persist to localStorage per workspace
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './TodoList.css';

export default function TodoList() {
    // Get the current workspace to create a unique storage key
    const workspace = useSelector(selectCurrentWorkspace);
    const storageKey = `stackpad-todos-${workspace?.id || 'default'}`;

    // ============================================
    // TODOS STATE
    // Initialize from localStorage on mount
    // ============================================
    const [todos, setTodos] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Input value for new todo
    const [newTodo, setNewTodo] = useState('');

    // Current filter: 'all', 'active', or 'completed'
    const [filter, setFilter] = useState('all');

    // Load todos when workspace changes
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            setTodos(stored ? JSON.parse(stored) : []);
        } catch {
            setTodos([]);
        }
    }, [storageKey]);

    // Save todos to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(todos));
    }, [todos, storageKey]);

    /**
     * addTodo - Adds a new task to the list
     * Each task has: id, text, completed status, priority, and createdAt timestamp
     */
    const addTodo = (e) => {
        e.preventDefault();
        const text = newTodo.trim();
        if (!text) return;  // Don't add empty todos

        const newTask = {
            id: Date.now(),  // Unique ID using timestamp
            text: text,
            completed: false,
            priority: 'normal',  // Default priority
            createdAt: new Date().toISOString(),
        };

        setTodos(prevTodos => [...prevTodos, newTask]);
        setNewTodo('');  // Clear input
    };

    /**
     * toggleTodo - Toggles the completed status of a task
     */
    const toggleTodo = (id) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    /**
     * deleteTodo - Removes a task from the list
     */
    const deleteTodo = (id) => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    };

    /**
     * setPriority - Updates the priority level of a task
     * Priorities: 'low', 'normal', 'high'
     */
    const setPriority = (id, priority) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, priority } : todo
            )
        );
    };

    /**
     * clearCompleted - Removes all completed tasks
     */
    const clearCompleted = () => {
        setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
    };

    // Apply filter to todos for display
    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;  // 'all' filter
    });

    // Calculate counts for filter badges
    const completedCount = todos.filter(t => t.completed).length;
    const activeCount = todos.filter(t => !t.completed).length;

    return (
        <div className="todo-list">
            {/* Header with title and workspace name */}
            <div className="todo-header">
                <h2 className="todo-title">
                    <span className="title-icon">✅</span>
                    To-Do List
                </h2>
                <span className="todo-workspace">{workspace?.name || 'Default'}</span>
            </div>

            {/* ====== ADD TODO FORM ====== */}
            <form className="add-todo-form" onSubmit={addTodo}>
                <input
                    type="text"
                    className="glass-input todo-input"
                    placeholder="What needs to be done?"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                />
                <button type="submit" className="glass-button primary add-btn">
                    + Add Task
                </button>
            </form>

            {/* ====== FILTER TABS ====== */}
            <div className="todo-filters">
                <button
                    type="button"
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({todos.length})
                </button>
                <button
                    type="button"
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active ({activeCount})
                </button>
                <button
                    type="button"
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Done ({completedCount})
                </button>
            </div>

            {/* ====== TODO ITEMS LIST ====== */}
            <div className="todo-items">
                {filteredTodos.length > 0 ? (
                    filteredTodos.map((todo) => (
                        <div
                            key={todo.id}
                            className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
                        >
                            {/* Checkbox to toggle completion */}
                            <button
                                type="button"
                                className="todo-checkbox"
                                onClick={() => toggleTodo(todo.id)}
                            >
                                {todo.completed ? '✓' : ''}
                            </button>

                            {/* Task text */}
                            <span className="todo-text">{todo.text}</span>

                            {/* Actions: priority dropdown and delete button */}
                            <div className="todo-actions">
                                <select
                                    className="priority-select"
                                    value={todo.priority}
                                    onChange={(e) => setPriority(todo.id, e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                                <button
                                    type="button"
                                    className="todo-delete"
                                    onClick={() => deleteTodo(todo.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    // Empty state message
                    <div className="no-todos">
                        <span className="no-todos-icon">📝</span>
                        <p>{filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks`}</p>
                    </div>
                )}
            </div>

            {/* ====== FOOTER: Clear completed button ====== */}
            {completedCount > 0 && (
                <div className="todo-footer">
                    <button type="button" className="clear-btn" onClick={clearCompleted}>
                        🧹 Clear completed ({completedCount})
                    </button>
                </div>
            )}
        </div>
    );
}
