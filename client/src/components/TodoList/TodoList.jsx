import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentWorkspace } from '../../redux/slices/workspaceSlice';
import './TodoList.css';

// Custom hook for localStorage with workspace
function useWorkspaceTodos() {
    const workspace = useSelector(selectCurrentWorkspace);
    const key = `stackpad-todos-${workspace?.id || 'default'}`;

    const [todos, setTodos] = useState(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        const stored = localStorage.getItem(key);
        setTodos(stored ? JSON.parse(stored) : []);
    }, [key]);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(todos));
    }, [todos, key]);

    return [todos, setTodos];
}

export default function TodoList() {
    const workspace = useSelector(selectCurrentWorkspace);
    const [todos, setTodos] = useWorkspaceTodos();
    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState('all');

    const addTodo = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        setTodos([
            ...todos,
            {
                id: Date.now(),
                text: newTodo.trim(),
                completed: false,
                priority: 'normal',
                createdAt: new Date().toISOString(),
            },
        ]);
        setNewTodo('');
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const setPriority = (id, priority) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, priority } : todo
        ));
    };

    const clearCompleted = () => {
        setTodos(todos.filter(todo => !todo.completed));
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
                <span className="todo-workspace">{workspace?.name}</span>
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
                <button type="submit" className="glass-button primary">
                    Add Task
                </button>
            </form>

            {/* Filter Tabs */}
            <div className="todo-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({todos.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active ({activeCount})
                </button>
                <button
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
                    <button className="clear-btn" onClick={clearCompleted}>
                        🧹 Clear completed ({completedCount})
                    </button>
                </div>
            )}
        </div>
    );
}
