# 💰 Personal Finance - Aplikasi Keuangan Personal

Aplikasi web Progressive Web App (PWA) untuk mengelola keuangan personal dengan fitur AI Financial Advisor.

## ✨ Fitur Utama

### 📊 Dashboard
- Overview keuangan bulan ini
- Status budget per kategori
- Transaksi terbaru
- Progress tujuan keuangan

### 🧾 Pengeluaran Harian
- Tambah transaksi (pemasukan & pengeluaran)
- Filter berdasarkan tanggal
- Kategori lengkap (termasuk Rokok)
- Edit & hapus transaksi

### 📈 Keuangan Bulanan
- Ringkasan income vs expense
- Chart breakdown per kategori
- Perbandingan bulan ke bulan
- Export laporan ke CSV

### 🎯 Tujuan Keuangan
- Set tujuan dengan timeframe (1-2y, 3-5y, 5+y)
- Prioritas (High/Medium/Low)
- Progress tracking visual
- Tambah kontribusi

### 🤖 AI Financial Advisor
- Chat dengan ChatGPT untuk rekomendasi
- Analisa keuangan otomatis
- Tips hemat & saran budget
- Strategi mencapai tujuan

## 🚀 Cara Menggunakan

### 1. Buka Aplikasi
```
Buka file index.html di browser
atau
Gunakan Live Server di VS Code
```

### 2. Install sebagai PWA (Opsional)
- Di Chrome/Edge: Klik icon install di address bar
- Di Mobile: Tap "Add to Home Screen"

### 3. Setup AI Advisor
1. Buka menu "AI Advisor"
2. Dapatkan API key dari [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Masukkan API key
4. Mulai chat dengan AI!

## 📁 Struktur Folder

```
personal-finance/
├── index.html              # Main HTML
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── styles.css              # Design system
├── app.js                  # Main controller
├── modules/
│   ├── dashboard.js        # Dashboard module
│   ├── daily-expenses.js   # Daily expenses module
│   ├── monthly-finance.js  # Monthly finance module
│   ├── financial-goals.js  # Goals module
│   └── ai-advisor.js       # AI advisor module
├── utils/
│   ├── storage.js          # LocalStorage wrapper
│   ├── helpers.js          # Helper functions
│   ├── export.js           # Export/Import functionality
│   └── openai.js           # ChatGPT integration
└── components/
    ├── modal.js            # Modal component
    └── toast.js            # Toast notification
```

## 💾 Data Storage

- **LocalStorage**: Semua data tersimpan di browser
- **Tidak ada server**: 100% client-side
- **Export/Import**: Backup data ke JSON/CSV

## 🎨 Fitur UI/UX

- ✅ Dark/Light theme toggle
- ✅ Responsive design (mobile & desktop)
- ✅ Smooth animations
- ✅ Glassmorphism effects
- ✅ PWA installable
- ✅ Offline support

## 🔒 Keamanan

- API key disimpan encrypted di LocalStorage
- Tidak ada data dikirim ke server lain (kecuali OpenAI untuk AI)
- Data hanya tersimpan di browser Anda

## 📤 Export & Backup

### Export All Data (JSON)
- Backup lengkap semua data
- Import di device lain

### Export Transactions (CSV)
- Compatible dengan Excel
- Untuk analisa lebih lanjut

### Export Monthly Report (CSV)
- Laporan bulanan lengkap
- Breakdown per kategori

## 🔧 Teknologi

- **HTML5** - Struktur
- **CSS3** - Styling dengan CSS Variables
- **JavaScript ES6+** - Logic
- **Chart.js** - Visualisasi data
- **LocalStorage API** - Data persistence
- **Service Worker** - PWA offline support
- **OpenAI API** - AI integration

## 📱 Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS)
- ✅ Firefox

## 🎯 Kategori Default

- 💰 Gaji/Income
- 🍔 Makan & Minum
- 🚗 Transport
- 🛒 Belanja
- 🎮 Hiburan
- 💡 Tagihan
- 💊 Kesehatan
- 🚬 Rokok
- 📦 Lainnya

## 💡 Tips Penggunaan

1. **Catat Setiap Hari**: Gunakan FAB button (➕) untuk quick add
2. **Set Budget**: Atur budget per kategori untuk monitoring
3. **Backup Rutin**: Export data secara berkala
4. **Gunakan AI**: Minta saran AI untuk optimasi keuangan
5. **Set Goals**: Buat tujuan keuangan untuk motivasi

## 🐛 Troubleshooting

### AI tidak merespon?
- Pastikan API key valid
- Cek koneksi internet
- Pastikan ada credit di akun OpenAI

### Data hilang?
- Jangan clear browser data
- Gunakan export untuk backup
- Data tersimpan per browser/device

### PWA tidak bisa install?
- Gunakan HTTPS atau localhost
- Pastikan manifest.json valid
- Coba browser lain

## 📝 Lisensi

Free to use untuk personal use.

## 🙏 Credits

Dibuat dengan ❤️ menggunakan:
- [Chart.js](https://www.chartjs.org/)
- [Google Fonts - Inter](https://fonts.google.com/)
- [OpenAI API](https://platform.openai.com/)

---

**Selamat mengelola keuangan! 💰🎉**
