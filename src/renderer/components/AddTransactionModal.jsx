import { useState } from 'react';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Business', 'Other']
};

export default function AddTransactionModal({ onClose, onAdd }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAdd({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
      });
      
      onClose();
    } catch (error) {
      alert('Failed to add transaction: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Transaction</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-option ${type === 'income' ? 'active income' : ''}`}
                onClick={() => {
                  setType('income');
                  setCategory('');
                }}
              >
                💵 Income
              </button>
              <button
                type="button"
                className={`type-option ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => {
                  setType('expense');
                  setCategory('');
                }}
              >
                💸 Expense
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (N$) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category...</option>
              {CATEGORIES[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note (optional)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

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
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}