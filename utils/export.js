// Export functionality for data backup and CSV generation

import { Storage, TransactionDB, GoalDB, BudgetDB } from './storage.js';
import { formatCurrency, formatDateShort } from './helpers.js';

// Export all data as JSON
export function exportAllData() {
    const data = {
        transactions: TransactionDB.getAll(),
        goals: GoalDB.getAll(),
        budgets: BudgetDB.getAll(),
        categories: Storage.get(Storage.KEYS.CATEGORIES),
        settings: Storage.get(Storage.KEYS.SETTINGS),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-finance-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import data from JSON
export function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate data structure
                if (!data.transactions || !data.goals) {
                    throw new Error('Invalid backup file format');
                }

                // Import data
                if (data.transactions) Storage.set(Storage.KEYS.TRANSACTIONS, data.transactions);
                if (data.goals) Storage.set(Storage.KEYS.GOALS, data.goals);
                if (data.budgets) Storage.set(Storage.KEYS.BUDGETS, data.budgets);
                if (data.categories) Storage.set(Storage.KEYS.CATEGORIES, data.categories);

                resolve(data);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Export transactions as CSV
export function exportTransactionsCSV() {
    const transactions = TransactionDB.getAll();
    const categories = Storage.get(Storage.KEYS.CATEGORIES);

    // CSV headers
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Catatan'];

    // CSV rows
    const rows = transactions.map(t => {
        const category = categories.find(c => c.id === t.category);
        return [
            formatDateShort(t.date),
            t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            category ? category.name : t.category,
            t.amount,
            t.notes || ''
        ];
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Export goals as CSV
export function exportGoalsCSV() {
    const goals = GoalDB.getAll();

    // CSV headers
    const headers = ['Nama', 'Target', 'Terkumpul', 'Progress', 'Timeframe', 'Prioritas', 'Status'];

    // CSV rows
    const rows = goals.map(g => {
        const progress = Math.round((g.currentAmount / g.targetAmount) * 100);
        const status = g.completedAt ? 'Selesai' : 'Aktif';
        return [
            g.name,
            g.targetAmount,
            g.currentAmount,
            `${progress}%`,
            g.timeframe,
            g.priority,
            status
        ];
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goals-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Export monthly report as CSV
export function exportMonthlyReportCSV(year, month) {
    const transactions = TransactionDB.getByMonth(year, month);
    const categories = Storage.get(Storage.KEYS.CATEGORIES);

    // Group by category
    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = 0;
            }
            categoryTotals[t.category] += t.amount;
        }
    });

    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // CSV content
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month));
    const csvContent = [
        `Laporan Keuangan - ${monthName} ${year}`,
        '',
        'RINGKASAN',
        `Total Pemasukan,${formatCurrency(totalIncome)}`,
        `Total Pengeluaran,${formatCurrency(totalExpense)}`,
        `Saldo Bersih,${formatCurrency(totalIncome - totalExpense)}`,
        '',
        'PENGELUARAN PER KATEGORI',
        'Kategori,Total',
        ...Object.entries(categoryTotals).map(([catId, total]) => {
            const category = categories.find(c => c.id === catId);
            return `${category ? category.name : catId},${formatCurrency(total)}`;
        })
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${year}-${month + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
