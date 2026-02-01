// AI Financial Advisor Module - ChatGPT integration for financial advice

import { TransactionDB, GoalDB, Storage } from '../utils/storage.js';
import { openAI } from '../utils/openai.js';
import { formatCurrency, getCurrentMonthYear, calculateTotalIncome, calculateTotalExpense, groupByCategory } from '../utils/helpers.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

export class AIAdvisorModule {
    constructor() {
        this.container = document.getElementById('ai-content');
        this.conversationHistory = [];
    }

    render() {
        const hasApiKey = openAI.hasApiKey();

        if (!hasApiKey) {
            this.renderApiKeySetup();
            return;
        }

        this.renderChatInterface();
    }

    renderApiKeySetup() {
        this.container.innerHTML = `
      <div class="card text-center" style="max-width: 600px; margin: 0 auto; padding: var(--space-2xl);">
        <div style="font-size: 4rem; margin-bottom: var(--space-md);">🤖</div>
        <h3 style="margin-bottom: var(--space-sm);">AI Financial Advisor</h3>
        <p class="text-muted" style="margin-bottom: var(--space-lg);">
          Dapatkan rekomendasi keuangan personal dari AI. Untuk menggunakan fitur ini, Anda perlu API key dari OpenAI.
        </p>
        
        <div style="background: var(--color-surface-hover); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-lg); text-align: left;">
          <div style="font-weight: 600; margin-bottom: var(--space-sm);">Cara mendapatkan API Key:</div>
          <ol style="margin-left: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            <li>Buka <a href="https://platform.openai.com/api-keys" target="_blank" style="color: var(--color-primary);">platform.openai.com/api-keys</a></li>
            <li>Login atau daftar akun OpenAI</li>
            <li>Klik "Create new secret key"</li>
            <li>Copy API key dan paste di bawah</li>
          </ol>
        </div>
        
        <form id="apiKeyForm" style="margin-bottom: var(--space-md);">
          <div class="form-group">
            <input type="password" id="apiKeyInput" class="input" placeholder="sk-..." required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Simpan API Key
          </button>
        </form>
        
        <p style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
          🔒 API key disimpan di browser Anda dan tidak pernah dikirim ke server lain selain OpenAI
        </p>
      </div>
    `;

        document.getElementById('apiKeyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('apiKeyInput').value.trim();

            if (!apiKey.startsWith('sk-')) {
                toast.error('API key tidak valid. Harus dimulai dengan "sk-"');
                return;
            }

            openAI.setApiKey(apiKey);
            toast.success('API key berhasil disimpan!');
            this.render();
        });
    }

    renderChatInterface() {
        this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <div>
          <h3 style="margin-bottom: var(--space-xs);">🤖 AI Financial Advisor</h3>
          <p class="text-muted">Tanyakan apapun tentang keuangan Anda</p>
        </div>
        <button class="btn btn-outline" onclick="window.app.modules.ai.resetApiKey()">
          🔑 Ganti API Key
        </button>
      </div>

      <div class="card mb-md">
        <h4 style="margin-bottom: var(--space-md);">💡 Quick Actions</h4>
        <div class="grid grid-2">
          <button class="btn btn-primary" onclick="window.app.modules.ai.analyzeFinances()">
            📊 Analisa Keuangan Saya
          </button>
          <button class="btn btn-primary" onclick="window.app.modules.ai.askSavingTips()">
            💰 Tips Hemat
          </button>
          <button class="btn btn-primary" onclick="window.app.modules.ai.askGoalAdvice()">
            🎯 Saran Capai Tujuan
          </button>
          <button class="btn btn-primary" onclick="window.app.modules.ai.askBudgetAdvice()">
            📈 Rekomendasi Budget
          </button>
        </div>
      </div>

      <div class="card" style="height: 500px; display: flex; flex-direction: column;">
        <div id="chatMessages" style="flex: 1; overflow-y: auto; padding: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
          <div class="text-muted text-center" style="padding: var(--space-xl);">
            Mulai percakapan dengan AI atau gunakan Quick Actions di atas
          </div>
        </div>
        
        <form id="chatForm" style="display: flex; gap: var(--space-sm);">
          <input type="text" id="chatInput" class="input" placeholder="Tanyakan sesuatu..." required style="flex: 1;">
          <button type="submit" class="btn btn-primary">
            Kirim
          </button>
        </form>
      </div>
    `;

        document.getElementById('chatForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            if (message) {
                this.sendMessage(message);
                input.value = '';
            }
        });
    }

    async sendMessage(userMessage) {
        const messagesContainer = document.getElementById('chatMessages');

        // Add user message
        this.addMessageToChat('user', userMessage);

        // Add loading indicator
        const loadingId = 'loading-' + Date.now();
        messagesContainer.innerHTML += `
      <div id="${loadingId}" style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          🤖
        </div>
        <div style="background: var(--color-surface-hover); padding: var(--space-md); border-radius: var(--radius-md); max-width: 70%;">
          <div class="text-muted">Sedang berpikir...</div>
        </div>
      </div>
    `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await openAI.chatWithContext(userMessage, this.conversationHistory);

            // Remove loading
            document.getElementById(loadingId)?.remove();

            // Add AI response
            this.addMessageToChat('assistant', response);

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: response }
            );

            // Limit history to last 10 messages
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

        } catch (error) {
            document.getElementById(loadingId)?.remove();
            this.addMessageToChat('error', 'Maaf, terjadi error: ' + error.message);
            toast.error('Gagal menghubungi AI: ' + error.message);
        }
    }

    addMessageToChat(role, content) {
        const messagesContainer = document.getElementById('chatMessages');

        // Clear initial message if exists
        if (messagesContainer.querySelector('.text-muted.text-center')) {
            messagesContainer.innerHTML = '';
        }

        const isUser = role === 'user';
        const isError = role === 'error';

        messagesContainer.innerHTML += `
      <div style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); ${isUser ? 'flex-direction: row-reverse;' : ''}">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: ${isUser ? 'var(--color-success)' : isError ? 'var(--color-danger)' : 'var(--color-primary)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${isUser ? '👤' : isError ? '⚠️' : '🤖'}
        </div>
        <div style="background: ${isUser ? 'var(--color-primary)' : isError ? 'var(--color-danger)' : 'var(--color-surface-hover)'}; color: ${isUser || isError ? 'white' : 'var(--color-text)'}; padding: var(--space-md); border-radius: var(--radius-md); max-width: 70%; white-space: pre-wrap;">
          ${content}
        </div>
      </div>
    `;

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async analyzeFinances() {
        const { year, month } = getCurrentMonthYear();
        const transactions = TransactionDB.getByMonth(year, month);
        const goals = GoalDB.getAll().filter(g => !g.completedAt);
        const categories = Storage.get(Storage.KEYS.CATEGORIES);

        const income = calculateTotalIncome(transactions);
        const expense = calculateTotalExpense(transactions);
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const grouped = groupByCategory(expenseTransactions);

        // Convert to category names
        const categoryBreakdown = {};
        Object.entries(grouped).forEach(([id, data]) => {
            const cat = categories.find(c => c.id === id);
            categoryBreakdown[cat?.name || id] = data;
        });

        const financialData = {
            income,
            expense,
            categoryBreakdown,
            goals,
            budgets: {}
        };

        this.addMessageToChat('user', 'Analisa keuangan saya bulan ini');

        const messagesContainer = document.getElementById('chatMessages');
        const loadingId = 'loading-' + Date.now();
        messagesContainer.innerHTML += `
      <div id="${loadingId}" style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          🤖
        </div>
        <div style="background: var(--color-surface-hover); padding: var(--space-md); border-radius: var(--radius-md); max-width: 70%;">
          <div class="text-muted">Menganalisa data keuangan Anda...</div>
        </div>
      </div>
    `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await openAI.getFinancialAdvice(financialData);
            document.getElementById(loadingId)?.remove();
            this.addMessageToChat('assistant', response);
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            this.addMessageToChat('error', 'Maaf, terjadi error: ' + error.message);
            toast.error('Gagal menganalisa: ' + error.message);
        }
    }

    askSavingTips() {
        this.sendMessage('Bagaimana cara saya bisa lebih hemat dan menabung lebih banyak?');
    }

    askGoalAdvice() {
        this.sendMessage('Bagaimana strategi terbaik untuk mencapai tujuan keuangan saya?');
    }

    askBudgetAdvice() {
        this.sendMessage('Berapa budget ideal untuk setiap kategori pengeluaran saya?');
    }

    resetApiKey() {
        modal.confirm(
            'Ganti API Key',
            'Apakah Anda yakin ingin mengganti API key? Riwayat chat akan dihapus.',
            () => {
                openAI.setApiKey('');
                this.conversationHistory = [];
                toast.success('API key dihapus');
                this.render();
            }
        );
    }
}
