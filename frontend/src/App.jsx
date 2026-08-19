import { useEffect, useState } from 'react';
import './App.css';
import Calendar from './Calendar';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activePage, setActivePage] = useState('tasks');
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [historyTodos, setHistoryTodos] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const completedCount = todos.filter((todo) => todo.completed).length;

  const filteredTodos = todos.filter((todo) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);

    const matchesSearch = todo.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const query = filter === 'all' ? '' : `?status=${filter}`;
        const res = await fetch(`http://localhost:5000/api/todos${query}`);
        const data = await res.json();
        setTodos(data);
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };

    loadTodos();
  }, [filter]);

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

  useEffect(() => {
    if (activePage !== 'history') {
      return;
    }

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const res = await fetch('http://localhost:5000/api/todos');
        const data = await res.json();
        const sortedTodos = [...data].sort(
          (firstTodo, secondTodo) => new Date(secondTodo.timestamp) - new Date(firstTodo.timestamp)
        );
        setHistoryTodos(sortedTodos);
      } catch (error) {
        console.error('Error loading history:', error);
        setHistoryError('Failed to load history. Please try again later.');
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [activePage]);

  const addTodo = async (e) => {
    e.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) return;

    if (normalizedTitle.length > 50) {
      alert('Todo title is too long');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: normalizedTitle }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Unable to create todo');
        return;
      }

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
            className={activePage === 'calendar' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('calendar')}
          >
            Calendar
          </button>
          <button
            type="button"
            className={activePage === 'insights' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('insights')}
          >
            Insights
          </button>
          <button
            type="button"
            className={activePage === 'history' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('history')}
          >
            History
          </button>
        </div>

        {activePage === 'tasks' && (
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

            <div className="toolbar">
              <div className="filter-group" role="tablist" aria-label="Todo filters">
                <button
                  type="button"
                  className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter('completed')}
                >
                  Done
                </button>
              </div>

              <input
                className="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks"
                aria-label="Search tasks"
              />
            </div>

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
              {filteredTodos.length === 0 ? (
                <li className="empty-state">
                  <strong>No matching tasks</strong>
                  <p>
                    {search
                      ? 'Try a different keyword or switch the filter.'
                      : 'Add your first task and begin your productive day.'}
                  </p>
                </li>
              ) : (
                filteredTodos.map((todo) => (
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
        )}
        {activePage === 'calendar' && <Calendar todos={todos} />}
        {activePage === 'insights' && (
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
        {activePage === 'history' && (
          <>
            <div className="hero">
              <div className="hero-badge hero-badge-history">↺ History</div>
              <h1>Your task timeline</h1>
              <p>Look back at every task you have added and see what is still in progress.</p>
            </div>

            {historyLoading ? (
              <div className="empty-state">Loading history...</div>
            ) : historyError ? (
              <div className="empty-state">{historyError}</div>
            ) : historyTodos.length === 0 ? (
              <div className="empty-state">
                <strong>Your history is empty</strong>
                <p>Tasks you add will appear here in chronological order.</p>
              </div>
            ) : (
              <div className="history-list">
                {historyTodos.map((todo) => {
                  const createdAt = new Date(todo.timestamp);
                  const dateLabel = Number.isNaN(createdAt.getTime())
                    ? 'Date unavailable'
                    : createdAt.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                  return (
                    <article key={todo._id} className={`history-item ${todo.completed ? 'completed' : ''}`}>
                      <div className="history-marker" aria-hidden="true">
                        {todo.completed ? '✓' : '•'}
                      </div>
                      <div className="history-content">
                        <strong>{todo.title}</strong>
                        <span>{dateLabel}</span>
                      </div>
                      <span className="history-status">
                        {todo.completed ? 'Completed' : 'In progress'}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;