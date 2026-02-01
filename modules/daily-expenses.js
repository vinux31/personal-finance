// Daily Expenses Module - Transaction management

import { TransactionDB, Storage, BudgetDB } from '../utils/storage.js';
import { formatCurrency, getTodayDate, formatDateShort, calculateTotalIncome, calculateTotalExpense } from '../utils/helpers.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export class DailyExpensesModule {
    constructor() {
        this.container = document.getElementById('daily-content');
        this.selectedDate = getTodayDate();
    }

    render() {
        const transactions = TransactionDB.getByDateRange(this.selectedDate, this.selectedDate);
        const categories = Storage.get(Storage.KEYS.CATEGORIES);

        const income = calculateTotalIncome(transactions);
        const expense = calculateTotalExpense(transactions);
        const net = income - expense;

        this.container.innerHTML = `
      <div class="card mb-lg">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
          <input type="date" id="dateFilter" class="input" value="${this.selectedDate}" style="max-width: 200px;">
          <button class="btn btn-primary" onclick="window.app.modules.daily.showAddTransactionModal()">
            ➕ Tambah Transaksi
          </button>
        </div>
        
        <div class="grid grid-3">
          <div style="text-align: center; padding: var(--space-md); background: var(--color-surface-hover); border-radius: var(--radius-md);">
            <div class="text-muted" style="font-size: var(--font-size-sm);">Pemasukan</div>
            <div class="text-success" style="font-size: var(--font-size-xl); font-weight: 700;">${formatCurrency(income)}</div>
          </div>
          <div style="text-align: center; padding: var(--space-md); background: var(--color-surface-hover); border-radius: var(--radius-md);">
            <div class="text-muted" style="font-size: var(--font-size-sm);">Pengeluaran</div>
            <div class="text-danger" style="font-size: var(--font-size-xl); font-weight: 700;">${formatCurrency(expense)}</div>
          </div>
          <div style="text-align: center; padding: var(--space-md); background: var(--color-surface-hover); border-radius: var(--radius-md);">
            <div class="text-muted" style="font-size: var(--font-size-sm);">Saldo Bersih</div>
            <div style="font-size: var(--font-size-xl); font-weight: 700; color: ${net >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${formatCurrency(net)}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: var(--space-md);">Transaksi (${transactions.length})</h3>
        <div id="transactionList">
          ${this.renderTransactionList(transactions, categories)}
        </div>
      </div>
    `;

        // Setup date filter
        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.selectedDate = e.target.value;
            this.render();
        });
    }

    renderTransactionList(transactions, categories) {
        if (transactions.length === 0) {
            return '<div class="text-muted text-center" style="padding: var(--space-xl);">Belum ada transaksi hari ini</div>';
        }

        return transactions.map(t => {
            const category = categories.find(c => c.id === t.category);
            return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-md); border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; align-items: center; gap: var(--space-md); flex: 1;">
            <span style="font-size: 2rem;">${category?.icon || '📦'}</span>
            <div style="flex: 1;">
              <div style="font-weight: 600;">${category?.name || t.category}</div>
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                ${t.notes || 'Tidak ada catatan'}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-md);">
            <div style="text-align: right;">
              <div style="font-weight: 700; font-size: var(--font-size-lg); color: ${t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'};">
                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
              </div>
              <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
                ${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </div>
            </div>
            <div style="display: flex; gap: var(--space-xs);">
              <button class="btn btn-outline" style="padding: var(--space-xs) var(--space-sm); font-size: var(--font-size-sm);" onclick="window.app.modules.daily.editTransaction('${t.id}')">
                ✏️
              </button>
              <button class="btn btn-outline" style="padding: var(--space-xs) var(--space-sm); font-size: var(--font-size-sm);" onclick="window.app.modules.daily.deleteTransaction('${t.id}')">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
        }).join('');
    }

    showAddTransactionModal() {
        const categories = Storage.get(Storage.KEYS.CATEGORIES);

        const formHTML = `
      <form id="transactionForm">
        <div class="form-group">
          <label class="form-label">Tipe</label>
          <div style="display: flex; gap: var(--space-sm);">
            <label style="flex: 1; padding: var(--space-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; text-align: center; transition: all var(--transition-base);" class="type-option">
              <input type="radio" name="type" value="expense" checked style="display: none;">
              <span style="font-size: var(--font-size-lg);">💸 Pengeluaran</span>
            </label>
            <label style="flex: 1; padding: var(--space-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; text-align: center; transition: all var(--transition-base);" class="type-option">
              <input type="radio" name="type" value="income" style="display: none;">
              <span style="font-size: var(--font-size-lg);">💰 Pemasukan</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Nominal (IDR)</label>
          <input type="number" name="amount" class="input" placeholder="0" required min="0" step="1000">
        </div>
        
        <div class="form-group">
          <label class="form-label">Kategori</label>
          <select name="category" class="select" required>
            ${categories.filter(c => c.type === 'expense').map(c =>
            `<option value="${c.id}">${c.icon} ${c.name}</option>`
        ).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Tanggal</label>
          <input type="date" name="date" class="input" value="${getTodayDate()}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Catatan (opsional)</label>
          <input type="text" name="notes" class="input" placeholder="Contoh: Makan siang di restoran">
        </div>
      </form>
    `;

        modal.show({
            title: '➕ Tambah Transaksi',
            content: formHTML,
            buttons: [
                { text: 'Batal', className: 'btn-outline' },
                {
                    text: 'Simpan',
                    className: 'btn-primary',
                    onClick: () => this.saveTransaction()
                }
            ]
        });

        // Setup type toggle
        setTimeout(() => {
            const typeOptions = document.querySelectorAll('.type-option');
            const categorySelect = document.querySelector('select[name="category"]');

            typeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const radio = option.querySelector('input[type="radio"]');
                    radio.checked = true;

                    // Update styles
                    typeOptions.forEach(opt => {
                        opt.style.borderColor = 'var(--color-border)';
                        opt.style.background = 'transparent';
                    });
                    option.style.borderColor = 'var(--color-primary)';
                    option.style.background = 'rgba(99, 102, 241, 0.1)';

                    // Update category options
                    const type = radio.value;
                    categorySelect.innerHTML = categories
                        .filter(c => c.type === type)
                        .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
                        .join('');
                });
            });

            // Trigger initial selection
            typeOptions[0].click();
        }, 100);
    }

    saveTransaction() {
        const form = document.getElementById('transactionForm');
        const formData = new FormData(form);

        const transaction = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            date: formData.get('date'),
            notes: formData.get('notes') || ''
        };

        if (!transaction.amount || transaction.amount <= 0) {
            toast.error('Nominal harus lebih dari 0');
            return;
        }

        TransactionDB.add(transaction);
        toast.success('Transaksi berhasil ditambahkan');
        this.render();

        // Refresh dashboard if visible
        if (window.app.modules.dashboard) {
            window.app.modules.dashboard.render();
        }
    }

    editTransaction(id) {
        const transaction = TransactionDB.getById(id);
        if (!transaction) return;

        // Similar to add but with pre-filled data
        toast.info('Fitur edit akan segera hadir');
    }

    deleteTransaction(id) {
        modal.confirm(
            'Hapus Transaksi',
            'Apakah Anda yakin ingin menghapus transaksi ini?',
            () => {
                TransactionDB.delete(id);
                toast.success('Transaksi berhasil dihapus');
                this.render();

                if (window.app.modules.dashboard) {
                    window.app.modules.dashboard.render();
                }
            }
        );
    }
}
