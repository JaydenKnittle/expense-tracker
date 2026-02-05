import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import { calculateGoalProgress, formatDeadline, getGoalTypeInfo } from '../utils/goalCalculations';

export default function Goals({ totals, transactions }) {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await window.electronAPI.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowAddModal(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowAddModal(true);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await window.electronAPI.deleteGoal(id);
        await loadGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      if (goal.completed) {
        await window.electronAPI.markGoalIncomplete(goal.id);
      } else {
        await window.electronAPI.markGoalComplete(goal.id);
      }
      await loadGoals();
    } catch (error) {
      console.error('Failed to toggle goal:', error);
    }
  };

  return (
    <div className="page-goals">
      <div className="page-header">
        <h2 className="page-title">Goals</h2>
        <button className="btn btn-primary" onClick={handleAddGoal}>
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">No goals yet</div>
          <div className="empty-state-description">
            Create your first goal to start tracking your financial progress
          </div>
          <button className="btn btn-primary" onClick={handleAddGoal} style={{ marginTop: '16px' }}>
            Create Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal, transactions, totals.balance);
            const typeInfo = getGoalTypeInfo(goal.type);
            const deadlineInfo = goal.deadline ? formatDeadline(goal.deadline) : null;

            return (
  <div className="page-goals">
    <div className="page-header">
      <h2 className="page-title">🎯 Financial Goals</h2>
    </div>

    {goals.length === 0 ? (
      <div className="empty-state">
        <div className="empty-state-icon">🎯</div>
        <div className="empty-state-title">No goals yet</div>
        <div className="empty-state-description">
          Create your first goal to start tracking your financial progress
        </div>
        <button className="btn btn-primary" onClick={handleAddGoal} style={{ marginTop: '24px', padding: '14px 32px' }}>
          + Create Your First Goal
        </button>
      </div>
    ) : (
      <>
        <div className="goals-grid">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal, transactions, totals.balance);
            const typeInfo = getGoalTypeInfo(goal.type);
            const deadlineInfo = goal.deadline ? formatDeadline(goal.deadline) : null;

            return (
              <div 
                key={goal.id} 
                className={`goal-card-new ${goal.completed ? 'completed' : ''}`}
              >
                <div className="goal-card-header">
                  <div className="goal-card-icon">{typeInfo.icon}</div>
                  <div className="goal-card-actions">
                    <button 
                      className="goal-action-btn"
                      onClick={() => handleEditGoal(goal)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="goal-action-btn"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="goal-card-body">
                  <h3 className="goal-card-title">{goal.title}</h3>
                  <div className="goal-card-type">{typeInfo.label}</div>

                  <div className="goal-card-amounts">
                    <div className="goal-current">
                      {formatCurrency(progress.current)}
                    </div>
                    <div className="goal-separator">/</div>
                    <div className="goal-target">
                      {formatCurrency(progress.target)}
                    </div>
                  </div>

                  <div className="goal-progress-wrapper">
                    <div className="goal-progress-bar-bg">
                      <div 
                        className={`goal-progress-bar-fill ${progress.onTrack ? 'on-track' : 'behind'}`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="goal-progress-text">
                      {progress.percentage.toFixed(1)}%
                    </div>
                  </div>

                  <div className="goal-card-footer">
                    <div className={`goal-status ${progress.onTrack ? 'on-track' : 'behind'}`}>
                      {progress.onTrack ? '✓ On track' : '⚠️ Behind'}
                    </div>
                    
                    {deadlineInfo && (
                      <div className={`goal-deadline ${deadlineInfo.overdue ? 'overdue' : ''}`}>
                        {deadlineInfo.text}
                      </div>
                    )}
                    
                    {progress.daysRemaining !== undefined && (
                      <div className="goal-time-remaining">
                        {progress.daysRemaining} days left
                      </div>
                    )}
                    
                    {progress.monthsRemaining !== undefined && (
                      <div className="goal-time-remaining">
                        {progress.monthsRemaining} months left
                      </div>
                    )}
                  </div>

                  <button 
                    className={`goal-complete-btn ${goal.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleComplete(goal)}
                  >
                    {goal.completed ? '✓ Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="goals-add-bottom">
          <button className="btn btn-primary" onClick={handleAddGoal}>
            + Add New Goal
          </button>
        </div>
      </>
    )}

    {showAddModal && (
      <AddGoalModal
        goal={editingGoal}
        onClose={() => {
          setShowAddModal(false);
          setEditingGoal(null);
        }}
        onSave={loadGoals}
      />
    )}
  </div>
);
          })}
        </div>
      )}

      {showAddModal && (
        <AddGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowAddModal(false);
            setEditingGoal(null);
          }}
          onSave={loadGoals}
        />
      )}
    </div>
  );
}

function AddGoalModal({ goal, onClose, onSave }) {
  const [title, setTitle] = useState(goal?.title || '');
  const [type, setType] = useState(goal?.type || 'balance');
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount || '');
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goalTypes = [
    { value: 'balance', label: 'Balance Goal', icon: '💰', description: 'Reach a specific total balance' },
    { value: 'monthly_savings', label: 'Monthly Savings', icon: '📅', description: 'Save an amount this month' },
    { value: 'yearly_savings', label: 'Yearly Savings', icon: '🎉', description: 'Save an amount this year' },
    { value: 'monthly_income', label: 'Monthly Income', icon: '📊', description: 'Earn a specific amount/month' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !targetAmount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (goal) {
        // Update existing goal
        await window.electronAPI.updateGoal({
          id: goal.id,
          title,
          type,
          targetAmount: parseFloat(targetAmount),
          deadline: deadline || null,
        });
      } else {
        // Create new goal
        await window.electronAPI.addGoal({
          title,
          type,
          targetAmount: parseFloat(targetAmount),
          deadline: deadline || null,
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      alert('Failed to save goal: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Goal Type Selector */}
          <div className="form-group">
            <label className="form-label">Goal Type</label>
            <div className="goal-type-grid">
              {goalTypes.map((gt) => (
                <div
                  key={gt.value}
                  className={`goal-type-option ${type === gt.value ? 'active' : ''}`}
                  onClick={() => setType(gt.value)}
                >
                  <div className="goal-type-icon">{gt.icon}</div>
                  <div className="goal-type-info">
                    <div className="goal-type-label">{gt.label}</div>
                    <div className="goal-type-description">{gt.description}</div>
                  </div>
                  <div className="goal-type-check">
                    {type === gt.value && '✓'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Goal Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Save for a car, Emergency fund, Monthly target"
              required
            />
          </div>

          {/* Target Amount */}
          <div className="form-group">
            <label className="form-label">Target Amount (N$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Deadline (optional) */}
          <div className="form-group">
            <label className="form-label">Deadline (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (goal ? 'Update Goal' : 'Create Goal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}