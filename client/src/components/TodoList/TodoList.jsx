import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './TodoList.css';

export default function TodoList() {
    const workspace = useSelector(selectCurrentWorkspace);
    const storageKey = `stackpad-todos-${workspace?.id || 'default'}`;

    // Initialize todos from localStorage
    const [todos, setTodos] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [newTodo, setNewTodo] = useState('');
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

    // Save todos whenever they change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(todos));
    }, [todos, storageKey]);

    const addTodo = (e) => {
        e.preventDefault();
        const text = newTodo.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'normal',
            createdAt: new Date().toISOString(),
        };

        setTodos(prevTodos => [...prevTodos, newTask]);
        setNewTodo('');
    };

    const toggleTodo = (id) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const deleteTodo = (id) => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    };

    const setPriority = (id, priority) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, priority } : todo
            )
        );
    };

    const clearCompleted = () => {
        setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    const completedCount = todos.filter(t => t.completed).length;
    const activeCount = todos.filter(t => !t.completed).length;

    return (
        <div className="todo-list">
            <div className="todo-header">
                <h2 className="todo-title">
                    <span className="title-icon">✅</span>
                    To-Do List
                </h2>
                <span className="todo-workspace">{workspace?.name || 'Default'}</span>
            </div>

            {/* Add Todo Form */}
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

            {/* Filter Tabs */}
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

            {/* Todo Items */}
            <div className="todo-items">
                {filteredTodos.length > 0 ? (
                    filteredTodos.map((todo) => (
                        <div
                            key={todo.id}
                            className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
                        >
                            <button
                                type="button"
                                className="todo-checkbox"
                                onClick={() => toggleTodo(todo.id)}
                            >
                                {todo.completed ? '✓' : ''}
                            </button>
                            <span className="todo-text">{todo.text}</span>
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
                    <div className="no-todos">
                        <span className="no-todos-icon">📝</span>
                        <p>{filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks`}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
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
