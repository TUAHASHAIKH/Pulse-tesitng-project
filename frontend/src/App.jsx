import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [activePage, setActivePage] = useState('tasks');
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const completedCount = todos.filter((todo) => todo.completed).length;

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/todos');
        const data = await res.json();
        setTodos(data);
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (activePage !== 'insights') {
      return;
    }

    const loadSummary = async () => {
      setSummaryLoading(true);

      try {
        const res = await fetch('http://localhost:5000/api/todos/summary');
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error('Error loading summary:', error);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [activePage, todos.length, completedCount]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();
      setTodos((prev) => [data, ...prev]);
      setTitle('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      const data = await res.json();
      setTodos((prev) => prev.map((todo) => (todo._id === id ? data : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE',
      });

      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <div className="page-nav" role="tablist" aria-label="Todo pages">
          <button
            type="button"
            className={activePage === 'tasks' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('tasks')}
          >
            Tasks
          </button>
          <button
            type="button"
            className={activePage === 'insights' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('insights')}
          >
            Insights
          </button>
        </div>

        {activePage === 'tasks' ? (
          <>
            <div className="hero">
              <div className="hero-badge">✨ Daily Focus</div>
              <h1>Stay on top of your day</h1>
              <p>Add your tasks, mark them done, and keep your plan clear.</p>
            </div>

            <form className="todo-form" onSubmit={addTodo}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
              <button type="submit">Add task</button>
            </form>

            <div className="stats">
              <div>
                <span>{todos.length}</span>
                <small>Total</small>
              </div>
              <div>
                <span>{completedCount}</span>
                <small>Done</small>
              </div>
              <div>
                <span>{todos.length - completedCount}</span>
                <small>Pending</small>
              </div>
            </div>

            <ul className="todo-list">
              {todos.length === 0 ? (
                <li className="empty-state">
                  <strong>No tasks yet</strong>
                  <p>Add your first task and begin your productive day.</p>
                </li>
              ) : (
                todos.map((todo) => (
                  <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <label className="todo-label">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={(e) => toggleTodo(todo._id, e.target.checked)}
                      />
                      <span>{todo.title}</span>
                    </label>

                    <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>
                      ×
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        ) : (
          <>
            <div className="hero">
              <div className="hero-badge hero-badge-alt">📊 Insights</div>
              <h1>See how the list is moving</h1>
              <p>Use the backend summary to understand progress at a glance.</p>
            </div>

            {summaryLoading ? (
              <div className="empty-state">Loading insights...</div>
            ) : summary ? (
              <div className="insights-grid">
                <article className="insight-card">
                  <span>Total tasks</span>
                  <strong>{summary.total}</strong>
                  <p>All tasks currently stored in the database.</p>
                </article>
                <article className="insight-card">
                  <span>Completed</span>
                  <strong>{summary.completed}</strong>
                  <p>Finished tasks that are already checked off.</p>
                </article>
                <article className="insight-card">
                  <span>Pending</span>
                  <strong>{summary.pending}</strong>
                  <p>Items still waiting for attention.</p>
                </article>
                <article className="insight-card wide">
                  <span>Latest activity</span>
                  <strong>{summary.latestTodo ?? 'No tasks yet'}</strong>
                  <p>
                    {summary.latestTimestamp
                      ? `Last task created on ${new Date(summary.latestTimestamp).toLocaleString()}.`
                      : 'Add a task to see the newest activity here.'}
                  </p>
                </article>
              </div>
            ) : (
              <div className="empty-state">
                <strong>No insights available</strong>
                <p>Switch back to Tasks and add some items first.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;