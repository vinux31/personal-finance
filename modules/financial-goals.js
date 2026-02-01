// Financial Goals Module - Goal tracking and management

import { GoalDB } from '../utils/storage.js';
import { formatCurrency } from '../utils/helpers.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export class FinancialGoalsModule {
    constructor() {
        this.container = document.getElementById('goals-content');
    }

    render() {
        const goals = GoalDB.getAll();
        const activeGoals = goals.filter(g => !g.completedAt);
        const completedGoals = goals.filter(g => g.completedAt);

        this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <div>
          <h3 style="margin-bottom: var(--space-xs);">Tujuan Keuangan</h3>
          <p class="text-muted">${activeGoals.length} aktif, ${completedGoals.length} selesai</p>
        </div>
        <button class="btn btn-primary" onclick="window.app.modules.goals.showAddGoalModal()">
          ➕ Tambah Tujuan
        </button>
      </div>

      ${activeGoals.length > 0 ? `
        <div class="grid grid-2">
          ${activeGoals.map(g => this.renderGoalCard(g)).join('')}
        </div>
      ` : `
        <div class="card text-center" style="padding: var(--space-2xl);">
          <div style="font-size: 4rem; margin-bottom: var(--space-md);">🎯</div>
          <h3 style="margin-bottom: var(--space-sm);">Belum Ada Tujuan</h3>
          <p class="text-muted" style="margin-bottom: var(--space-lg);">Mulai rencanakan tujuan keuangan Anda</p>
          <button class="btn btn-primary" onclick="window.app.modules.goals.showAddGoalModal()">
            Tambah Tujuan Pertama
          </button>
        </div>
      `}

      ${completedGoals.length > 0 ? `
        <div class="mt-lg">
          <h3 style="margin-bottom: var(--space-md);">✅ Tujuan Tercapai</h3>
          <div class="grid grid-2">
            ${completedGoals.map(g => this.renderGoalCard(g, true)).join('')}
          </div>
        </div>
      ` : ''}
    `;
    }

    renderGoalCard(goal, isCompleted = false) {
        const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
        const remaining = goal.targetAmount - goal.currentAmount;

        return `
      <div class="card" style="${isCompleted ? 'opacity: 0.7;' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-md);">
          <div style="flex: 1;">
            <h4 style="margin-bottom: var(--space-sm);">${goal.name}</h4>
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <span class="badge badge-${goal.priority === 'high' ? 'danger' : goal.priority === 'medium' ? 'warning' : 'primary'}">
                ${goal.priority === 'high' ? '🔴 High' : goal.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
              </span>
              <span class="badge badge-primary">
                ${goal.timeframe === '1-2y' ? '1-2 Tahun' : goal.timeframe === '3-5y' ? '3-5 Tahun' : '5+ Tahun'}
              </span>
              ${isCompleted ? '<span class="badge badge-success">✅ Selesai</span>' : ''}
            </div>
          </div>
          <div style="font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-primary);">
            ${progress}%
          </div>
        </div>

        <div style="background: var(--color-border); height: 16px; border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-md);">
          <div style="background: linear-gradient(90deg, var(--color-primary), var(--color-success)); height: 100%; width: ${progress}%; transition: width var(--transition-slow);"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md); font-size: var(--font-size-sm);">
          <div>
            <div class="text-muted">Terkumpul</div>
            <div style="font-weight: 700; color: var(--color-success);">${formatCurrency(goal.currentAmount)}</div>
          </div>
          <div style="text-align: right;">
            <div class="text-muted">Target</div>
            <div style="font-weight: 700;">${formatCurrency(goal.targetAmount)}</div>
          </div>
        </div>

        ${!isCompleted ? `
          <div style="padding: var(--space-md); background: var(--color-surface-hover); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
            <div class="text-muted" style="font-size: var(--font-size-sm); margin-bottom: var(--space-xs);">Sisa yang dibutuhkan</div>
            <div style="font-weight: 700; font-size: var(--font-size-lg); color: var(--color-primary);">${formatCurrency(remaining)}</div>
          </div>

          <div style="display: flex; gap: var(--space-sm);">
            <button class="btn btn-primary" style="flex: 1;" onclick="window.app.modules.goals.showContributeModal('${goal.id}')">
              💰 Tambah Kontribusi
            </button>
            <button class="btn btn-outline" onclick="window.app.modules.goals.deleteGoal('${goal.id}')">
              🗑️
            </button>
          </div>
        ` : ''}
      </div>
    `;
    }

    showAddGoalModal() {
        const formHTML = `
      <form id="goalForm">
        <div class="form-group">
          <label class="form-label">Nama Tujuan</label>
          <input type="text" name="name" class="input" placeholder="Contoh: Dana Darurat" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Target Nominal (IDR)</label>
          <input type="number" name="targetAmount" class="input" placeholder="0" required min="1000" step="1000">
        </div>
        
        <div class="form-group">
          <label class="form-label">Jangka Waktu</label>
          <select name="timeframe" class="select" required>
            <option value="1-2y">1-2 Tahun</option>
            <option value="3-5y">3-5 Tahun</option>
            <option value="5+y">5+ Tahun</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Prioritas</label>
          <select name="priority" class="select" required>
            <option value="high">🔴 High - Sangat Penting</option>
            <option value="medium" selected>🟡 Medium - Penting</option>
            <option value="low">🟢 Low - Bisa Ditunda</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Catatan (opsional)</label>
          <input type="text" name="notes" class="input" placeholder="Catatan tambahan">
        </div>
      </form>
    `;

        modal.show({
            title: '🎯 Tambah Tujuan Keuangan',
            content: formHTML,
            buttons: [
                { text: 'Batal', className: 'btn-outline' },
                {
                    text: 'Simpan',
                    className: 'btn-primary',
                    onClick: () => this.saveGoal()
                }
            ]
        });
    }

    saveGoal() {
        const form = document.getElementById('goalForm');
        const formData = new FormData(form);

        const goal = {
            name: formData.get('name'),
            targetAmount: parseFloat(formData.get('targetAmount')),
            timeframe: formData.get('timeframe'),
            priority: formData.get('priority'),
            notes: formData.get('notes') || ''
        };

        if (!goal.targetAmount || goal.targetAmount <= 0) {
            toast.error('Target nominal harus lebih dari 0');
            return;
        }

        GoalDB.add(goal);
        toast.success('Tujuan berhasil ditambahkan! 🎉');
        this.render();
    }

    showContributeModal(goalId) {
        const goal = GoalDB.getById(goalId);
        if (!goal) return;

        const remaining = goal.targetAmount - goal.currentAmount;

        const formHTML = `
      <div style="margin-bottom: var(--space-lg); padding: var(--space-md); background: var(--color-surface-hover); border-radius: var(--radius-md);">
        <div style="font-weight: 600; margin-bottom: var(--space-xs);">${goal.name}</div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          Sisa: ${formatCurrency(remaining)}
        </div>
      </div>
      
      <form id="contributeForm">
        <div class="form-group">
          <label class="form-label">Nominal Kontribusi (IDR)</label>
          <input type="number" name="amount" class="input" placeholder="0" required min="1000" step="1000">
        </div>
        
        <div class="form-group">
          <label class="form-label">Catatan (opsional)</label>
          <input type="text" name="notes" class="input" placeholder="Contoh: Bonus bulan ini">
        </div>
      </form>
    `;

        modal.show({
            title: '💰 Tambah Kontribusi',
            content: formHTML,
            buttons: [
                { text: 'Batal', className: 'btn-outline' },
                {
                    text: 'Simpan',
                    className: 'btn-primary',
                    onClick: () => this.saveContribution(goalId)
                }
            ]
        });
    }

    saveContribution(goalId) {
        const form = document.getElementById('contributeForm');
        const formData = new FormData(form);

        const amount = parseFloat(formData.get('amount'));
        const notes = formData.get('notes') || '';

        if (!amount || amount <= 0) {
            toast.error('Nominal harus lebih dari 0');
            return;
        }

        const goal = GoalDB.addContribution(goalId, amount, notes);

        if (goal.completedAt) {
            toast.success('🎉 Selamat! Tujuan tercapai!');
        } else {
            toast.success('Kontribusi berhasil ditambahkan');
        }

        this.render();
    }

    deleteGoal(goalId) {
        modal.confirm(
            'Hapus Tujuan',
            'Apakah Anda yakin ingin menghapus tujuan ini?',
            () => {
                GoalDB.delete(goalId);
                toast.success('Tujuan berhasil dihapus');
                this.render();
            }
        );
    }
}
