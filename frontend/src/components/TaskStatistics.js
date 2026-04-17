import React from 'react';
import '../styles/TaskStatistics.css';

const TaskStatistics = ({ totalTasks, completedTasks, pendingTasks, completionPercentage, onClose }) => {
  return (
    <div className="task-stats">
      <div className="task-stats-header">
        <h2>Task Statistics</h2>
        <button className="close-icon" onClick={onClose} aria-label="Close statistics">
          ✕
        </button>
      </div>

      <div className="task-stats-grid">
        <div className="stats-card">
          <div className="card-label">Total Tasks</div>
          <div className="card-number">{totalTasks}</div>
        </div>

        <div className="stats-card accent-green">
          <div className="card-label">Completed</div>
          <div className="card-number">{completedTasks}</div>
        </div>

        <div className="stats-card accent-blue">
          <div className="card-label">Pending</div>
          <div className="card-number">{pendingTasks}</div>
        </div>
      </div>

      <div className="completion-progress">
        <div className="progress-info">
          <span className="progress-label">Progress</span>
          <span className="progress-percent">{completionPercentage}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TaskStatistics;
