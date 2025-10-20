# DevHub Explorer - GitHub Repository Discovery & Analysis

<div align="center">

![DevHub Explorer](public/github-explorer-icon.svg)

**Discover • Analyze • Export**

A powerful, modern GitHub repository explorer built with React, TypeScript, and Tailwind CSS. Find trending repositories, search with advanced filters, bookmark favorites, and export detailed reports.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

## ✨ Features

### 🔍 **Advanced Search & Discovery**
- **Trending Repositories**: Discover the most starred repositories from the last 10 days
- **Recent Updates**: Find recently active repositories
- **Smart Search**: Advanced search with multiple filters and country-specific targeting
- **Real-time Results**: Instant search with GitHub API integration

### 🎯 **Powerful Filters**
- **Language**: Filter by programming language (JavaScript, Python, TypeScript, Go, Rust, etc.)
- **Popularity**: Filter by star count (100+, 1,000+, 10,000+)
- **Activity**: Filter by fork count and last update time
- **Geographic**: Search repositories from specific countries/regions
- **Topics**: Filter for repositories with topics/tags

### 📊 **Repository Analysis**
- **Detailed Stats**: Stars, forks, watchers, issues, and size information
- **Activity Metrics**: Last updated, creation date, and maintenance status
- **License Information**: Detect and display repository licenses
- **Topic Analysis**: Repository tags and categorization

### 📚 **Bookmarking System**
- **Local Storage**: Save favorite repositories locally
- **Quick Access**: One-click access to bookmarked repos
- **Organization**: Browse your saved collection easily

### 📤 **Export Capabilities**
- **Markdown Reports**: Generate detailed markdown reports
- **JSON Export**: Export structured data for analysis
- **Repository Summaries**: Create comprehensive analysis summaries
- **Batch Export**: Export multiple selected repositories

### 🎨 **Modern UI/UX**
- **Dark Mode**: Automatic dark/light theme switching
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ariefrse/github-explorer.git
   cd github-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5176`

### Building for Production

```bash
npm run build
```

The production files will be in the `dist` directory.

## 📖 Usage Guide

### 🔍 Searching Repositories

1. **Basic Search**: Enter keywords in the search bar
2. **Advanced Filters**: Click "Filters" to reveal advanced options
3. **Apply Filters**: Choose language, stars, forks, and update time
4. **Country Search**: Select specific countries for regional repositories
5. **Instant Results**: See results update in real-time

### 📊 Using Export Features

1. **Select Repositories**: Check the boxes next to repositories you want to export
2. **Choose Export Format**:
   - **Summary**: Comprehensive analysis with insights
   - **Markdown**: Structured report format
   - **JSON**: Raw data for programmatic use
3. **Download**: Files are downloaded automatically to your device

### 📚 Bookmark Management

1. **Save Repositories**: Click the bookmark icon on any repository
2. **View Bookmarks**: Switch to the "Bookmarks" tab
3. **Manage Collection**: Remove or export your bookmarked repositories

### 🌙 Dark Mode

- Toggle dark mode using the moon/sun icon in the header
- Preference is automatically saved
- Respects system color scheme preferences

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development experience
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Icons & UI
- **Lucide React** - Beautiful, consistent icon set
- **Custom SVG** - Branded icon and visual elements

### APIs & Integration
- **GitHub REST API** - Repository data and search functionality
- **Browser APIs** - Clipboard, storage, and file download

## 📁 Project Structure

```
github-explorer/
├── public/                 # Static assets
│   ├── github-explorer-icon.svg
│   └── ...
├── src/                   # Source code
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── ...
├── dist/                  # Build output
├── README.md              # This file
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🔧 Configuration

### Environment Variables

The application uses GitHub's public API, so no authentication is required. However, you can customize the behavior:

```typescript
// In src/App.tsx
const GITHUB_API_BASE = 'https://api.github.com';
const RESULTS_PER_PAGE = 20;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### API Rate Limits

- GitHub API allows 60 requests per hour for unauthenticated users
- The application implements intelligent caching to minimize API calls
- Consider using GitHub OAuth for higher rate limits in production

## 🎨 Customization

### Adding New Filters

1. Update the `SearchFilters` interface in `src/App.tsx`
2. Add filter UI components in the search section
3. Update the `buildSearchQuery` function
4. Handle the new filter in `handleFilterChange`

### Modifying Export Formats

1. Edit the export functions in `src/App.tsx`
2. `exportToMarkdown()` - Modify markdown template
3. `exportToJSON()` - Adjust JSON structure
4. `generateRepoSummary()` - Customize summary content

### Theming

The application uses Tailwind CSS with a custom dark mode implementation:

```css
/* Customize colors in tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          // ... more shades
        }
      }
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use semantic HTML elements
- Maintain accessibility standards
- Write clean, commented code
- Test on multiple screen sizes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub** - For the amazing API and platform
- **Lucide** - For the beautiful icon set
- **Tailwind CSS** - For the excellent CSS framework
- **Vite** - For the blazing-fast build tool
- **React** - For the powerful UI library

## 📊 Roadmap

### Upcoming Features
- [ ] GitHub OAuth integration for higher rate limits
- [ ] Repository comparison tool
- [ ] Advanced analytics and insights
- [ ] Team/organization repository browsing
- [ ] Integration with Git providers (GitLab, Bitbucket)
- [ ] Repository contribution graphs
- [ ] Custom themes and branding
- [ ] API for programmatic access

### Performance Improvements
- [ ] Infinite scroll for large result sets
- [ ] Advanced caching strategies
- [ ] Service worker for offline support
- [ ] Image lazy loading
- [ ] Bundle optimization

## 🐛 Troubleshooting

### Common Issues

**Build Fails with TypeScript Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**API Rate Limit Exceeded**
- Wait for the rate limit to reset (up to 1 hour)
- Consider implementing GitHub OAuth
- Use the application more efficiently with better filtering

**Dark Mode Not Working**
- Check browser localStorage settings
- Ensure JavaScript is enabled
- Try refreshing the page

**Search Not Returning Results**
- Verify your internet connection
- Check if GitHub API is accessible
- Try broader search terms

### Getting Help

- Open an issue on GitHub
- Check the troubleshooting section
- Review the documentation
- Search existing issues

## 📈 Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Ariefrse/github-explorer?style=social)
![GitHub forks](https://img.shields.io/github/forks/Ariefrse/github-explorer?style=social)
![GitHub issues](https://img.shields.io/github/issues/Ariefrse/github-explorer)
![GitHub license](https://img.shields.io/github/license/Ariefrse/github-explorer)

</div>

---

<div align="center">

**Built with ❤️ by the GitHub community**

[⭐ Star this repo](https://github.com/Ariefrse/github-explorer) • [🐛 Report issues](https://github.com/Ariefrse/github-explorer/issues) • [💡 Suggest features](https://github.com/Ariefrse/github-explorer/discussions)

</div>