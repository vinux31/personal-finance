// Dashboard Module - Overview of all financial data

import { TransactionDB, GoalDB, BudgetDB, Storage } from '../utils/storage.js';
import { formatCurrency, getCurrentMonthYear, calculateTotalIncome, calculateTotalExpense, getTodayDate } from '../utils/helpers.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export class DashboardModule {
  constructor() {
    this.container = document.getElementById('dashboard-content');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="set-budget"]');
      if (btn) {
        const categoryId = btn.dataset.categoryId;
        const categoryName = btn.dataset.categoryName;
        this.showSetBudgetModal(categoryId, categoryName);
      }
    });
  }

  render() {
    const { year, month } = getCurrentMonthYear();
    const today = getTodayDate();

    // Get data
    const monthlyTransactions = TransactionDB.getByMonth(year, month);
    const todayTransactions = TransactionDB.getByDateRange(today, today);
    const goals = GoalDB.getAll().filter(g => !g.completedAt);
    const budgets = BudgetDB.getAll();
    const categories = Storage.get(Storage.KEYS.CATEGORIES);

    // Calculate stats
    const monthlyIncome = calculateTotalIncome(monthlyTransactions);
    const monthlyExpense = calculateTotalExpense(monthlyTransactions);
    const monthlyNet = monthlyIncome - monthlyExpense;

    const todayIncome = calculateTotalIncome(todayTransactions);
    const todayExpense = calculateTotalExpense(todayTransactions);

    // Budget health
    const budgetStatus = this.getBudgetStatus(monthlyTransactions, budgets, categories);

    this.container.innerHTML = `
      <div class="grid grid-3">
        <!-- Quick Stats -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
            <span style="font-size: 2rem;">💰</span>
            <div>
              <div class="text-muted" style="font-size: var(--font-size-sm);">Saldo Bulan Ini</div>
              <div style="font-size: var(--font-size-2xl); font-weight: 700; color: ${monthlyNet >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                ${formatCurrency(monthlyNet)}
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm);">
            <div>
              <div class="text-muted">Pemasukan</div>
              <div class="text-success" style="font-weight: 600;">${formatCurrency(monthlyIncome)}</div>
            </div>
            <div style="text-align: right;">
              <div class="text-muted">Pengeluaran</div>
              <div class="text-danger" style="font-weight: 600;">${formatCurrency(monthlyExpense)}</div>
            </div>
          </div>
        </div>

        <!-- Today's Activity -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
            <span style="font-size: 2rem;">📅</span>
            <div>
              <div class="text-muted" style="font-size: var(--font-size-sm);">Aktivitas Hari Ini</div>
              <div style="font-size: var(--font-size-2xl); font-weight: 700;">
                ${todayTransactions.length} transaksi
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm);">
            <div>
              <div class="text-muted">Pemasukan</div>
              <div class="text-success" style="font-weight: 600;">${formatCurrency(todayIncome)}</div>
            </div>
            <div style="text-align: right;">
              <div class="text-muted">Pengeluaran</div>
              <div class="text-danger" style="font-weight: 600;">${formatCurrency(todayExpense)}</div>
            </div>
          </div>
        </div>

        <!-- Goals Progress -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
            <span style="font-size: 2rem;">🎯</span>
            <div>
              <div class="text-muted" style="font-size: var(--font-size-sm);">Tujuan Aktif</div>
              <div style="font-size: var(--font-size-2xl); font-weight: 700;">
                ${goals.length} tujuan
              </div>
            </div>
          </div>
          ${goals.length > 0 ? `
            <div style="font-size: var(--font-size-sm);">
              <div class="text-muted">Progress rata-rata</div>
              <div style="font-weight: 600; color: var(--color-primary);">
                ${Math.round(goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length)}%
              </div>
            </div>
          ` : '<div class="text-muted" style="font-size: var(--font-size-sm);">Belum ada tujuan</div>'}
        </div>
      </div>

      <!-- Budget Health -->
      <div class="card mt-lg">
        <h3 style="margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);">
            <span>📊</span> Status Budget Bulan Ini
        </h3>
        <div class="grid grid-2">
            ${budgetStatus.map(item => `
            <div style="padding: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                <div style="display: flex; align-items: center; gap: var(--space-sm);">
                    <span>${item.icon}</span>
                    <span style="font-weight: 600;">${item.name}</span>
                </div>
                ${item.budget > 0 ? `
                    <span class="badge badge-${item.status === 'safe' ? 'success' : item.status === 'warning' ? 'warning' : 'danger'}">
                    ${item.status === 'safe' ? 'Aman' : item.status === 'warning' ? 'Hati-hati' : 'Over'}
                    </span>
                ` : ''}
                </div>
                
                ${item.budget > 0 ? `
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-xs);">
                    ${formatCurrency(item.spent)} / ${formatCurrency(item.budget)}
                </div>
                <div style="background: var(--color-border); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
                    <div style="background: ${item.status === 'safe' ? 'var(--color-success)' : item.status === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)'}; height: 100%; width: ${Math.min(item.percentage, 100)}%; transition: width var(--transition-base);"></div>
                </div>
                <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-xs);">
                    ${item.percentage}% terpakai
                </div>
                <button class="btn btn-outline mt-sm" style="font-size: var(--font-size-xs); width: 100%; padding: 4px;" data-action="set-budget" data-category-id="${item.categoryId}" data-category-name="${item.name}">
                    ✏️ Edit Budget
                </button>
                ` : `
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-sm);">
                    Terpakai: ${formatCurrency(item.spent)}
                </div>
                <div class="text-muted" style="font-size: var(--font-size-xs); margin-bottom: var(--space-sm);">
                    Belum ada budget
                </div>
                <button class="btn btn-primary mt-sm" style="font-size: var(--font-size-xs); width: 100%; padding: 4px;" data-action="set-budget" data-category-id="${item.categoryId}" data-category-name="${item.name}">
                    ➕ Set Budget
                </button>
                `}
            </div>
            `).join('')}
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card mt-lg">
        <h3 style="margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);">
          <span>📝</span> Transaksi Terbaru
        </h3>
        ${this.renderRecentTransactions(monthlyTransactions.slice(-5).reverse(), categories)}
      </div>

      <!-- Active Goals -->
      ${goals.length > 0 ? `
        <div class="card mt-lg">
          <h3 style="margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);">
            <span>🎯</span> Tujuan Keuangan Aktif
          </h3>
          ${this.renderActiveGoals(goals.slice(0, 3))}
        </div>
      ` : ''}
    `;
  }

  getBudgetStatus(transactions, budgets, categories) {
    const expenseCategories = categories.filter(c => c.type === 'expense');

    return expenseCategories.map(category => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === category.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const budget = budgets[category.id] || 0;
      let percentage = 0;
      let status = 'safe';

      if (budget > 0) {
        percentage = Math.round((spent / budget) * 100);
        if (percentage >= 100) status = 'over';
        else if (percentage >= 80) status = 'warning';
      }

      return {
        categoryId: category.id,
        name: category.name,
        icon: category.icon,
        spent,
        budget,
        percentage,
        status
      };
    });
  }

  renderRecentTransactions(transactions, categories) {
    if (transactions.length === 0) {
      return '<div class="text-muted text-center" style="padding: var(--space-lg);">Belum ada transaksi</div>';
    }

    return transactions.map(t => {
      const category = categories.find(c => c.id === t.category);
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-md); border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; align-items: center; gap: var(--space-md);">
            <span style="font-size: var(--font-size-xl);">${category?.icon || '📦'}</span>
            <div>
              <div style="font-weight: 600;">${category?.name || t.category}</div>
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${new Date(t.date).toLocaleDateString('id-ID')}</div>
            </div>
          </div>
          <div style="font-weight: 700; color: ${t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'};">
            ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
          </div>
        </div>
      `;
    }).join('');
  }

  renderActiveGoals(goals) {
    return goals.map(g => {
      const progress = Math.round((g.currentAmount / g.targetAmount) * 100);
      return `
        <div style="padding: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
            <div>
              <div style="font-weight: 600; margin-bottom: var(--space-xs);">${g.name}</div>
              <span class="badge badge-${g.priority === 'high' ? 'danger' : g.priority === 'medium' ? 'warning' : 'primary'}">
                ${g.priority === 'high' ? '🔴 High' : g.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
              </span>
              <span class="badge badge-primary" style="margin-left: var(--space-xs);">
                ${g.timeframe === '1-2y' ? '1-2 Tahun' : g.timeframe === '3-5y' ? '3-5 Tahun' : '5+ Tahun'}
              </span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: var(--font-size-xl); font-weight: 700; color: var(--color-primary);">${progress}%</div>
            </div>
          </div>
          <div style="background: var(--color-border); height: 12px; border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-sm);">
            <div style="background: linear-gradient(90deg, var(--color-primary), var(--color-success)); height: 100%; width: ${progress}%; transition: width var(--transition-slow);"></div>
          </div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)}
          </div>
        </div>
      `;
    }).join('');
  }

  showSetBudgetModal(categoryId, categoryName) {
    const currentBudget = BudgetDB.get(categoryId) || 0;

    modal.show({
      title: `Set Budget: ${categoryName}`,
      content: `
            <div class="form-group">
                <label class="form-label">Batas Pengeluaran Bulanan (Rp)</label>
                <input type="number" id="budgetAmount" class="input" value="${currentBudget > 0 ? currentBudget : ''}" placeholder="Contoh: 1000000" autofocus>
                <p class="text-muted" style="font-size: var(--font-size-xs); margin-top: 5px;">
                    Anda akan mendapat peringatan jika pengeluaran mendekati angka ini.
                </p>
            </div>
        `,
      buttons: [
        { text: 'Batal', className: 'btn-outline' },
        {
          text: 'Simpan Budget',
          className: 'btn-primary',
          onClick: () => {
            const input = document.getElementById('budgetAmount');
            const amount = input.value;

            if (amount && amount > 0) {
              BudgetDB.set(categoryId, parseInt(amount));
              this.render(); // Refresh dashboard
              toast.success(`Budget untuk ${categoryName} berhasil disimpan!`);
            } else if (amount == 0) {
              BudgetDB.delete(categoryId);
              this.render();
              toast.success(`Budget untuk ${categoryName} dihapus.`);
            } else {
              toast.error('Mohon masukkan jumlah budget');
              input.focus();
              // Keep modal open
              return;
            }
          }
        }
      ]
    });
  }
}
