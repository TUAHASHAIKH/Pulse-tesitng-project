import { useState } from 'react';

function Calendar({ todos }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

const FIRST_DAY_OF_WEEK = 0;
const MONTHS_IN_YEAR = 12;

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay() - FIRST_DAY_OF_WEEK;
  };


  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  const nextMonth = () => {
    const newMonth = currentDate.getMonth() + 1;
    const newYear = currentDate.getFullYear() + Math.floor(newMonth / MONTHS_IN_YEAR);
    const adjustedMonth = newMonth % MONTHS_IN_YEAR;
    setCurrentDate(new Date(newYear, adjustedMonth));
  };

  const today = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];
  const todosByDay = {};
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  for (const todo of todos) {
    const todoDate = new Date(todo.timestamp);
    if (!isNaN(todoDate.getTime())) {
      const day = todoDate.getDate();
      if (!todosByDay[day]) todosByDay[day] = [];
      todosByDay[day].push(todo);
    }
  }
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <div className="hero">
        <div className="hero-badge">📅 Calendar</div>
        <h1>View your tasks by date</h1>
        <p>See which days have tasks and stay organized throughout the month.</p>
      </div>

      <div className="calendar-card">
        <div className="calendar-header">
          <button type="button" onClick={previousMonth} className="nav-arrow">
            ←
          </button>
          <h2>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button type="button" onClick={nextMonth} className="nav-arrow">
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((day, index) => {
            const dayTodos = day ? todosByDay[day] || [] : [];
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={index}
                className={`calendar-day ${day ? 'active' : 'empty'} ${isToday ? 'today' : ''} ${dayTodos.length > 0 ? 'has-tasks' : ''}`}
              >
                {day ? (
                  <>
                    <div className="day-number">{day}</div>
                    {dayTodos.length > 0 && (
                      <div className="task-indicator">
                        <span className="task-count">{dayTodos.length}</span>
                        <p className="task-preview">{dayTodos[0].title.substring(0, 12)}</p>
                      </div>
                    )}
                  </>
                ) : null}
                </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-box has-tasks"></span>
            <span>Days with tasks</span>
          </div>
          <div className="legend-item">
            <span className="legend-box today"></span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
