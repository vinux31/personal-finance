// Monthly Finance Module - Monthly overview and analytics

import { TransactionDB, Storage } from '../utils/storage.js';
import { formatCurrency, getCurrentMonthYear, getMonthName, calculateTotalIncome, calculateTotalExpense, groupByCategory } from '../utils/helpers.js';

export class MonthlyFinanceModule {
    constructor() {
        this.container = document.getElementById('monthly-content');
        const { year, month } = getCurrentMonthYear();
        this.selectedYear = year;
        this.selectedMonth = month;
    }

    render() {
        const transactions = TransactionDB.getByMonth(this.selectedYear, this.selectedMonth);
        const categories = Storage.get(Storage.KEYS.CATEGORIES);

        const income = calculateTotalIncome(transactions);
        const expense = calculateTotalExpense(transactions);
        const net = income - expense;

        // Group expenses by category
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const grouped = groupByCategory(expenseTransactions);

        this.container.innerHTML = `
      <div class="card mb-lg">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
          <div style="display: flex; gap: var(--space-sm);">
            <select id="monthSelect" class="select" style="width: 150px;">
              ${Array.from({ length: 12 }, (_, i) => `
                <option value="${i}" ${i === this.selectedMonth ? 'selected' : ''}>
                  ${getMonthName(i)}
                </option>
              `).join('')}
            </select>
            <select id="yearSelect" class="select" style="width: 100px;">
              ${Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return `<option value="${year}" ${year === this.selectedYear ? 'selected' : ''}>${year}</option>`;
        }).join('')}
            </select>
          </div>
        </div>
        
        <div class="grid grid-3">
          <div style="text-align: center; padding: var(--space-lg); background: linear-gradient(135deg, var(--color-success), #059669); border-radius: var(--radius-lg); color: white;">
            <div style="font-size: var(--font-size-sm); opacity: 0.9;">Total Pemasukan</div>
            <div style="font-size: var(--font-size-3xl); font-weight: 700; margin-top: var(--space-xs);">${formatCurrency(income)}</div>
          </div>
          <div style="text-align: center; padding: var(--space-lg); background: linear-gradient(135deg, var(--color-danger), #dc2626); border-radius: var(--radius-lg); color: white;">
            <div style="font-size: var(--font-size-sm); opacity: 0.9;">Total Pengeluaran</div>
            <div style="font-size: var(--font-size-3xl); font-weight: 700; margin-top: var(--space-xs);">${formatCurrency(expense)}</div>
          </div>
          <div style="text-align: center; padding: var(--space-lg); background: linear-gradient(135deg, ${net >= 0 ? 'var(--color-primary)' : 'var(--color-warning)'}, ${net >= 0 ? '#4f46e5' : '#d97706'}); border-radius: var(--radius-lg); color: white;">
            <div style="font-size: var(--font-size-sm); opacity: 0.9;">Saldo Bersih</div>
            <div style="font-size: var(--font-size-3xl); font-weight: 700; margin-top: var(--space-xs);">${formatCurrency(net)}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3 style="margin-bottom: var(--space-md);">📊 Pengeluaran per Kategori</h3>
          <canvas id="categoryChart" style="max-height: 300px;"></canvas>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: var(--space-md);">📈 Breakdown Kategori</h3>
          <div id="categoryBreakdown">
            ${this.renderCategoryBreakdown(grouped, categories, expense)}
          </div>
        </div>
      </div>
    `;

        // Setup selectors
        document.getElementById('monthSelect').addEventListener('change', (e) => {
            this.selectedMonth = parseInt(e.target.value);
            this.render();
        });

        document.getElementById('yearSelect').addEventListener('change', (e) => {
            this.selectedYear = parseInt(e.target.value);
            this.render();
        });

        // Render chart
        setTimeout(() => this.renderChart(grouped, categories), 100);
    }

    renderCategoryBreakdown(grouped, categories, totalExpense) {
        if (Object.keys(grouped).length === 0) {
            return '<div class="text-muted text-center" style="padding: var(--space-lg);">Belum ada pengeluaran</div>';
        }

        const sorted = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);

        return sorted.map(([categoryId, data]) => {
            const category = categories.find(c => c.id === categoryId);
            const percentage = Math.round((data.total / totalExpense) * 100);

            return `
        <div style="margin-bottom: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              <span>${category?.icon || '📦'}</span>
              <span style="font-weight: 600;">${category?.name || categoryId}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700;">${formatCurrency(data.total)}</div>
              <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">${percentage}%</div>
            </div>
          </div>
          <div style="background: var(--color-border); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
            <div style="background: var(--color-primary); height: 100%; width: ${percentage}%; transition: width var(--transition-base);"></div>
          </div>
        </div>
      `;
        }).join('');
    }

    renderChart(grouped, categories) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const sorted = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
        const labels = sorted.map(([id]) => {
            const cat = categories.find(c => c.id === id);
            return cat ? cat.name : id;
        });
        const data = sorted.map(([, d]) => d.total);

        const colors = [
            '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6',
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
        ];

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + formatCurrency(context.parsed);
                            }
                        }
                    }
                }
            }
        });
    }
}
