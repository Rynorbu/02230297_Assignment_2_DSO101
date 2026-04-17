import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Check, X, AlertCircle, ClipboardList, BarChart3 } from 'lucide-react';
import TaskStatistics from './components/TaskStatistics';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showStats, setShowStats] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/todos`);
      setTodos(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos. Make sure the backend is running.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new todo
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/todos`, newTodo);
      setNewTodo({ title: '', description: '' });
      setShowDescription(false);
      fetchTodos();
      setError('');
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  // Update todo
  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/api/todos/${id}`, editForm);
      setEditingId(null);
      setEditForm({ title: '', description: '' });
      fetchTodos();
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (todo) => {
    try {
      await axios.put(`${API_URL}/api/todos/${todo.id}`, {
        completed: !todo.completed
      });
      fetchTodos();
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error toggling todo:', err);
    }
  };

  // Delete todo
  const handleDelete = (id) => {
    setConfirmMessage('Are you sure you want to delete this todo?');
    setPendingAction(() => async () => {
      try {
        await axios.delete(`${API_URL}/api/todos/${id}`);
        fetchTodos();
        setError('');
        setShowConfirmModal(false);
      } catch (err) {
        setError('Failed to delete todo');
        console.error('Error deleting todo:', err);
      }
    });
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmMessage('');
    setPendingAction(null);
  };

  // Start editing
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditForm({ title: todo.title, description: todo.description });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Calculate stats
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <div className="header-top">
            <div className="header-content">
              <h1>TaskFlow</h1>
              <p className="subtitle">Organize, focus, and achieve</p>
            </div>
            <div className="stats-button-container">
              <button 
                className="stats-button"
                onClick={() => setShowStats(!showStats)}
                title="View task statistics"
                aria-label="View task statistics"
              >
                <BarChart3 size={20} />
                <div className="stats-mini">
                  <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{totalTasks}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-label">Done</span>
                    <span className="stat-value">{completedTasks}</span>
                  </div>
                </div>
              </button>
              
              {showStats && (
                <div className="stats-modal">
                  <TaskStatistics
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    pendingTasks={pendingTasks}
                    completionPercentage={completionPercentage}
                    onClose={() => setShowStats(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Create Todo Form */}
        <form onSubmit={handleCreate} className="todo-form">
          <h2>Add New Todo</h2>
          <input
            type="text"
            placeholder="Enter todo title *"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            className="input-field"
          />
          <div className="form-row">
            <button
              type="button"
              className="dropdown-icon-btn"
              onClick={() => setShowDescription(!showDescription)}
              title="Toggle description"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={`chevron-icon ${showDescription ? 'open' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button type="submit" className="btn btn-primary btn-add">
              <Plus size={18} />
              <span>Add Todo</span>
            </button>
          </div>
          {showDescription && (
            <textarea
              placeholder="Enter description (optional)"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="input-field textarea-field"
              rows="3"
            />
          )}
        </form>

        {/* Todos List */}
        <div className="todos-section">
          <div className="section-header">
            <h2>My Todos</h2>
            <span className="todo-count">
              {todos.length} {todos.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Filter Tabs */}
          {todos.length > 0 && (
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                <ClipboardList size={18} />
                <span>All</span>
              </button>
              <button
                className={`filter-tab ${filterType === 'active' ? 'active' : ''}`}
                onClick={() => setFilterType('active')}
              >
                <AlertCircle size={18} />
                <span>Active</span>
              </button>
              <button
                className={`filter-tab ${filterType === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterType('completed')}
              >
                <Check size={18} />
                <span>Completed</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading todos...</span>
            </div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <p>No todos yet</p>
              <span>Create your first todo above!</span>
            </div>
          ) : (
            <>
              {todos.filter((todo) => {
                if (filterType === 'active') return !todo.completed;
                if (filterType === 'completed') return todo.completed;
                return true;
              }).length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={48} />
                  <p>No {filterType} tasks</p>
                  <span>All caught up!</span>
                </div>
              ) : (
                <div className="todos-list">
                  {todos
                    .filter((todo) => {
                      if (filterType === 'active') return !todo.completed;
                      if (filterType === 'completed') return todo.completed;
                      return true;
                    })
                    .map((todo) => (
                <div
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  {editingId === todo.id ? (
                    // Edit Mode
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="input-field"
                        placeholder="Todo title"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="input-field textarea-field"
                        rows="2"
                        placeholder="Description"
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdate(todo.id)}
                          className="btn btn-success btn-sm"
                          type="button"
                        >
                          <Check size={14} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-secondary btn-sm"
                          type="button"
                        >
                          <X size={14} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="todo-row">
                      <div className="todo-content">
                        <button
                          type="button"
                          className={`checkbox-btn ${todo.completed ? 'checked' : ''}`}
                          onClick={() => handleToggleComplete(todo)}
                          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {todo.completed && <Check size={14} strokeWidth={3} />}
                        </button>
                        <div className="todo-text">
                          <h3 className={todo.completed ? 'strikethrough' : ''}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="todo-description">{todo.description}</p>
                          )}
                          <span className="todo-date">
                            Created: {new Date(todo.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="todo-actions">
                        <button
                          onClick={() => startEdit(todo)}
                          className="btn btn-icon"
                          disabled={todo.completed}
                          title="Edit"
                          type="button"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="btn btn-icon btn-icon-danger"
                          title="Delete"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
              )}
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h3 className="modal-title">Confirm Action</h3>
              <p className="modal-message">{confirmMessage}</p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelConfirm}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleConfirm}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
