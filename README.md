# Expense Tracker Desktop

Advanced expense tracking application with analytics and goal tracking for Windows, macOS, and Linux.

## 🚀 Features

- 💰 Track income and expenses
- 📊 Advanced analytics and insights
- 🎯 Financial goal tracking
- 📈 Cashflow projections
- 🔄 Recurring transactions
- 📅 Spending heatmaps
- 💾 Local SQLite database

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ and npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📦 Building

### Build for Windows
```bash
npm run build:win
```
Output: `release/Expense Tracker Setup 1.0.0.exe`

### Build for macOS
```bash
npm run build:mac
```
Output: `release/Expense Tracker-1.0.0.dmg`

### Build for Linux
```bash
npm run build:linux
```
Output: `release/Expense Tracker-1.0.0.AppImage`

## 📥 Downloading Releases

**Do not download from the repository!** 

Binary releases are distributed through:
- [GitHub Releases](https://github.com/yourusername/expense-tracker/releases) ← Recommended
- Direct download links (see Releases page)

## 🏗️ Project Structure

```
expense-tracker/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.js
│   │   ├── preload.js
│   │   └── database.js
│   └── renderer/       # React frontend
│       ├── components/
│       ├── pages/
│       ├── styles/
│       └── utils/
├── build/              # Build assets (icons, etc.)
├── .babelrc
├── webpack.config.js
└── package.json
```

## 🔧 Tech Stack

- **Electron** - Desktop framework
- **React 18** - UI framework
- **better-sqlite3** - Local database
- **Chart.js** - Data visualization
- **Webpack 5** - Bundler

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Jayden - NUST Computer Science Student

## 🐛 Issues

Found a bug? [Open an issue](https://github.com/yourusername/expense-tracker/issues)

---

**Note:** This repository contains source code only. For pre-built installers, visit the [Releases](https://github.com/yourusername/expense-tracker/releases) page.