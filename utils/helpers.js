// Helper functions for formatting and calculations

// Format currency to IDR
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number with thousand separator
export function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

// Format date to Indonesian locale
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(new Date(date));
}

// Format date to short format (DD/MM/YYYY)
export function formatDateShort(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Get first day of month
export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).toISOString().split('T')[0];
}

// Get last day of month
export function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).toISOString().split('T')[0];
}

// Get current month and year
export function getCurrentMonthYear() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth()
    };
}

// Get month name in Indonesian
export function getMonthName(month) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month];
}

// Calculate percentage
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// Calculate change percentage
export function calculateChangePercentage(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// Group transactions by category
export function groupByCategory(transactions) {
    const grouped = {};
    transactions.forEach(t => {
        if (!grouped[t.category]) {
            grouped[t.category] = {
                total: 0,
                count: 0,
                transactions: []
            };
        }
        grouped[t.category].total += t.amount;
        grouped[t.category].count++;
        grouped[t.category].transactions.push(t);
    });
    return grouped;
}

// Calculate total income
export function calculateTotalIncome(transactions) {
    return transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

// Calculate total expense
export function calculateTotalExpense(transactions) {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
}

// Calculate net (income - expense)
export function calculateNet(transactions) {
    return calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
}

// Get category by id
export function getCategoryById(categories, id) {
    return categories.find(c => c.id === id);
}

// Generate unique ID
export function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get relative time (e.g., "2 hari lalu")
export function getRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Truncate text
export function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Sort array by property
export function sortBy(array, property, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}
