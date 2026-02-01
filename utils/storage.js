// Storage utility for LocalStorage operations
export const Storage = {
  // Keys
  KEYS: {
    TRANSACTIONS: 'pf_transactions',
    GOALS: 'pf_goals',
    BUDGETS: 'pf_budgets',
    RECURRING: 'pf_recurring',
    SETTINGS: 'pf_settings',
    CATEGORIES: 'pf_categories'
  },

  // Get data from LocalStorage
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  // Set data to LocalStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  // Remove data from LocalStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      this.remove(key);
    });
  },

  // Initialize default data
  init() {
    // Initialize categories if not exists
    if (!this.get(this.KEYS.CATEGORIES)) {
      this.set(this.KEYS.CATEGORIES, [
        { id: 'income', name: 'Gaji/Income', icon: '💰', type: 'income' },
        { id: 'food', name: 'Makan & Minum', icon: '🍔', type: 'expense' },
        { id: 'transport', name: 'Transport', icon: '🚗', type: 'expense' },
        { id: 'shopping', name: 'Belanja', icon: '🛒', type: 'expense' },
        { id: 'entertainment', name: 'Hiburan', icon: '🎮', type: 'expense' },
        { id: 'bills', name: 'Tagihan', icon: '💡', type: 'expense' },
        { id: 'health', name: 'Kesehatan', icon: '💊', type: 'expense' },
        { id: 'cigarette', name: 'Rokok', icon: '🚬', type: 'expense' },
        { id: 'other', name: 'Lainnya', icon: '📦', type: 'expense' }
      ]);
    }

    // Initialize transactions if not exists
    if (!this.get(this.KEYS.TRANSACTIONS)) {
      this.set(this.KEYS.TRANSACTIONS, []);
    }

    // Initialize goals if not exists
    if (!this.get(this.KEYS.GOALS)) {
      this.set(this.KEYS.GOALS, []);
    }

    // Initialize budgets if not exists
    if (!this.get(this.KEYS.BUDGETS)) {
      this.set(this.KEYS.BUDGETS, {});
    }

    // Initialize recurring if not exists
    if (!this.get(this.KEYS.RECURRING)) {
      this.set(this.KEYS.RECURRING, []);
    }

    // Initialize settings if not exists
    if (!this.get(this.KEYS.SETTINGS)) {
      this.set(this.KEYS.SETTINGS, {
        theme: 'light',
        currency: 'IDR',
        apiKey: ''
      });
    }
  }
};

// Transaction operations
export const TransactionDB = {
  getAll() {
    return Storage.get(Storage.KEYS.TRANSACTIONS) || [];
  },

  getById(id) {
    const transactions = this.getAll();
    return transactions.find(t => t.id === id);
  },

  add(transaction) {
    const transactions = this.getAll();
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      timestamp: Date.now()
    };
    transactions.push(newTransaction);
    Storage.set(Storage.KEYS.TRANSACTIONS, transactions);
    return newTransaction;
  },

  update(id, updates) {
    const transactions = this.getAll();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      Storage.set(Storage.KEYS.TRANSACTIONS, transactions);
      return transactions[index];
    }
    return null;
  },

  delete(id) {
    const transactions = this.getAll();
    const filtered = transactions.filter(t => t.id !== id);
    Storage.set(Storage.KEYS.TRANSACTIONS, filtered);
    return true;
  },

  getByDateRange(startDate, endDate) {
    const transactions = this.getAll();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= new Date(startDate) && tDate <= new Date(endDate);
    });
  },

  getByMonth(year, month) {
    const transactions = this.getAll();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
  }
};

// Goal operations
export const GoalDB = {
  getAll() {
    return Storage.get(Storage.KEYS.GOALS) || [];
  },

  getById(id) {
    const goals = this.getAll();
    return goals.find(g => g.id === id);
  },

  add(goal) {
    const goals = this.getAll();
    const newGoal = {
      id: Date.now().toString(),
      ...goal,
      currentAmount: 0,
      contributions: [],
      createdAt: Date.now(),
      completedAt: null
    };
    goals.push(newGoal);
    Storage.set(Storage.KEYS.GOALS, goals);
    return newGoal;
  },

  update(id, updates) {
    const goals = this.getAll();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      Storage.set(Storage.KEYS.GOALS, goals);
      return goals[index];
    }
    return null;
  },

  delete(id) {
    const goals = this.getAll();
    const filtered = goals.filter(g => g.id !== id);
    Storage.set(Storage.KEYS.GOALS, filtered);
    return true;
  },

  addContribution(goalId, amount, notes = '') {
    const goal = this.getById(goalId);
    if (goal) {
      const contribution = {
        amount,
        date: new Date().toISOString().split('T')[0],
        notes,
        timestamp: Date.now()
      };
      goal.contributions.push(contribution);
      goal.currentAmount += amount;
      
      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount && !goal.completedAt) {
        goal.completedAt = Date.now();
      }
      
      this.update(goalId, goal);
      return goal;
    }
    return null;
  }
};

// Budget operations
export const BudgetDB = {
  getAll() {
    return Storage.get(Storage.KEYS.BUDGETS) || {};
  },

  set(category, limit) {
    const budgets = this.getAll();
    budgets[category] = limit;
    Storage.set(Storage.KEYS.BUDGETS, budgets);
    return budgets;
  },

  get(category) {
    const budgets = this.getAll();
    return budgets[category] || 0;
  },

  delete(category) {
    const budgets = this.getAll();
    delete budgets[category];
    Storage.set(Storage.KEYS.BUDGETS, budgets);
    return budgets;
  }
};
