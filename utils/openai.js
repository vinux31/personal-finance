// OpenAI API integration for AI Financial Advisor

import { Storage } from './storage.js';

export class OpenAIClient {
    constructor() {
        this.apiKey = this.getApiKey();
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
    }

    getApiKey() {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        return settings?.apiKey || '';
    }

    setApiKey(key) {
        const settings = Storage.get(Storage.KEYS.SETTINGS) || {};
        settings.apiKey = key;
        Storage.set(Storage.KEYS.SETTINGS, settings);
        this.apiKey = key;
    }

    hasApiKey() {
        return this.apiKey && this.apiKey.length > 0;
    }

    async chat(messages, options = {}) {
        if (!this.hasApiKey()) {
            throw new Error('API key tidak ditemukan. Silakan set API key terlebih dahulu.');
        }

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: options.model || 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 1000
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
        }
    }

    // Generate financial analysis prompt
    generateAnalysisPrompt(financialData) {
        const { income, expense, categoryBreakdown, goals, budgets } = financialData;

        let prompt = `Kamu adalah financial advisor Indonesia yang helpful dan praktis. Analisa data keuangan berikut:\n\n`;

        prompt += `RINGKASAN BULAN INI:\n`;
        prompt += `- Total Pemasukan: Rp ${income.toLocaleString('id-ID')}\n`;
        prompt += `- Total Pengeluaran: Rp ${expense.toLocaleString('id-ID')}\n`;
        prompt += `- Saldo Bersih: Rp ${(income - expense).toLocaleString('id-ID')}\n\n`;

        if (Object.keys(categoryBreakdown).length > 0) {
            prompt += `PENGELUARAN PER KATEGORI:\n`;
            Object.entries(categoryBreakdown).forEach(([category, data]) => {
                const percentage = Math.round((data.total / expense) * 100);
                prompt += `- ${category}: Rp ${data.total.toLocaleString('id-ID')} (${percentage}%)\n`;
            });
            prompt += `\n`;
        }

        if (goals && goals.length > 0) {
            prompt += `TUJUAN KEUANGAN:\n`;
            goals.forEach(goal => {
                const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                prompt += `- ${goal.name}: ${progress}% tercapai (Rp ${goal.currentAmount.toLocaleString('id-ID')} / Rp ${goal.targetAmount.toLocaleString('id-ID')})\n`;
            });
            prompt += `\n`;
        }

        prompt += `Berikan analisa singkat dan 3 saran konkret untuk meningkatkan kesehatan keuangan. Gunakan Bahasa Indonesia yang friendly dan mudah dipahami.`;

        return prompt;
    }

    // Get AI financial advice
    async getFinancialAdvice(financialData) {
        const systemMessage = {
            role: 'system',
            content: 'Kamu adalah personal financial advisor Indonesia yang helpful, praktis, dan memberikan saran yang actionable. Gunakan Bahasa Indonesia yang friendly dan mudah dipahami.'
        };

        const userMessage = {
            role: 'user',
            content: this.generateAnalysisPrompt(financialData)
        };

        return await this.chat([systemMessage, userMessage]);
    }

    // Chat with context
    async chatWithContext(userMessage, conversationHistory = []) {
        const systemMessage = {
            role: 'system',
            content: 'Kamu adalah personal financial advisor Indonesia. Bantu user dengan pertanyaan keuangan mereka. Berikan jawaban yang praktis dan actionable dalam Bahasa Indonesia.'
        };

        const messages = [systemMessage, ...conversationHistory, {
            role: 'user',
            content: userMessage
        }];

        return await this.chat(messages);
    }
}

export const openAI = new OpenAIClient();
