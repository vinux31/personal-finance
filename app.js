// Main application controller

import { Storage } from './utils/storage.js';
import { toast } from './components/toast.js';
import { DashboardModule } from './modules/dashboard.js';
import { DailyExpensesModule } from './modules/daily-expenses.js';
import { MonthlyFinanceModule } from './modules/monthly-finance.js';
import { FinancialGoalsModule } from './modules/financial-goals.js';
import { AIAdvisorModule } from './modules/ai-advisor.js';

class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.modules = {};
        this.init();
    }

    init() {
        // Initialize storage
        Storage.init();

        // Load theme
        this.loadTheme();

        // Initialize modules
        this.modules.dashboard = new DashboardModule();
        this.modules.daily = new DailyExpensesModule();
        this.modules.monthly = new MonthlyFinanceModule();
        this.modules.goals = new FinancialGoalsModule();
        this.modules.ai = new AIAdvisorModule();

        // Setup event listeners
        this.setupNavigation();
        this.setupThemeToggle();
        this.setupFAB();

        // Register service worker for PWA
        this.registerServiceWorker();

        // Load initial page
        this.showPage('dashboard');

        console.log('✅ Personal Finance App initialized');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.showPage(page);

                // Update active state
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            page.classList.add('active');
            this.currentPage = pageName;

            // Render module
            if (this.modules[pageName]) {
                this.modules[pageName].render();
            }
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';

            // Save to storage
            const settings = Storage.get(Storage.KEYS.SETTINGS) || {};
            settings.theme = newTheme;
            Storage.set(Storage.KEYS.SETTINGS, settings);
        });
    }

    loadTheme() {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const theme = settings?.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    setupFAB() {
        const fabButton = document.getElementById('fabButton');
        fabButton.addEventListener('click', () => {
            // Open add transaction modal
            if (this.modules.daily) {
                this.modules.daily.showAddTransactionModal();
            }
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }

    refreshAllModules() {
        Object.values(this.modules).forEach(module => {
            if (module.render) {
                module.render();
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
