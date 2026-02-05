const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Database path (saved in user's app data folder)
const dbPath = path.join(app.getPath('userData'), 'expenses.db');
const db = new Database(dbPath);

console.log('📁 Database location:', dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    savings_goal REAL DEFAULT 1000000,
    goal_date TEXT,
    currency TEXT DEFAULT 'N$'
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    deadline TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0
  );

  INSERT OR IGNORE INTO settings (id, savings_goal) VALUES (1, 1000000);
`);

// Add isRecurring column if it doesn't exist (migration)
try {
  db.exec(`ALTER TABLE transactions ADD COLUMN isRecurring INTEGER DEFAULT 0;`);
  console.log('✅ Added isRecurring column');
} catch (error) {
  console.log('✅ isRecurring column already exists');
}

console.log('✅ Database initialized');

// Transaction functions
const transactions = {
  add: (type, amount, category, description, date, isRecurring = false) => {
    const stmt = db.prepare(
      'INSERT INTO transactions (type, amount, category, description, date, isRecurring) VALUES (?, ?, ?, ?, ?, ?)'
    );
    return stmt.run(type, amount, category, description, date, isRecurring ? 1 : 0);
  },

  getAll: () => {
    return db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();
  },

  delete: (id) => {
    return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  },

  getTotals: () => {
    const income = db.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
    ).get();
    
    const expenses = db.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
    ).get();

    return {
      income: income.total || 0,
      expenses: expenses.total || 0,
      balance: (income.total || 0) - (expenses.total || 0)
    };
  },

  getCategoryTotals: () => {
    return db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'expense'
      GROUP BY category 
      ORDER BY total DESC
    `).all();
  }
};

// Settings functions
const settings = {
  get: () => {
    return db.prepare('SELECT * FROM settings WHERE id = 1').get();
  },

  update: (savingsGoal, goalDate) => {
    return db.prepare(
      'UPDATE settings SET savings_goal = ?, goal_date = ? WHERE id = 1'
    ).run(savingsGoal, goalDate);
  }
};

// Goals functions
const goals = {
  add: (title, type, targetAmount, deadline = null) => {
    const stmt = db.prepare(
      'INSERT INTO goals (title, type, target_amount, deadline) VALUES (?, ?, ?, ?)'
    );
    return stmt.run(title, type, targetAmount, deadline);
  },

  getAll: () => {
    return db.prepare('SELECT * FROM goals WHERE archived = 0 ORDER BY created_at DESC').all();
  },

  getById: (id) => {
    return db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  },

  update: (id, title, type, targetAmount, deadline = null) => {
    const stmt = db.prepare(
      'UPDATE goals SET title = ?, type = ?, target_amount = ?, deadline = ? WHERE id = ?'
    );
    return stmt.run(title, type, targetAmount, deadline, id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  },

  archive: (id) => {
    return db.prepare('UPDATE goals SET archived = 1 WHERE id = ?').run(id);
  },

  markComplete: (id) => {
    return db.prepare('UPDATE goals SET completed = 1 WHERE id = ?').run(id);
  },

  markIncomplete: (id) => {
    return db.prepare('UPDATE goals SET completed = 0 WHERE id = ?').run(id);
  }
};

// Clear database function
const clearDatabase = () => {
  try {
    db.exec(`
      DELETE FROM transactions;
      DELETE FROM goals;
      DELETE FROM sqlite_sequence WHERE name='transactions';
      DELETE FROM sqlite_sequence WHERE name='goals';
      UPDATE settings SET savings_goal = 1000000, goal_date = NULL WHERE id = 1;
    `);
    console.log('✅ Database cleared!');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    return false;
  }
};

module.exports = { transactions, settings, goals, db, clearDatabase };