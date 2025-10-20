import { useState, useEffect, useCallback } from 'react';
import {
  Star, TrendingUp, Clock, ExternalLink, ChevronLeft, ChevronRight,
  Package, Calendar, Filter, Search, Download,
  BookmarkPlus, GitFork, Eye, Code2, FileJson, Copy, Check,
  Sun, Moon
} from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
    type: string;
  };
  html_url: string;
  clone_url: string;
  ssh_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
  } | null;
  default_branch: string;
}

interface SearchFilters {
  language: string;
  stars: 'any' | '100+' | '1000+' | '10000+';
  forks: 'any' | '10+' | '100+' | '1000+';
  updated: 'any' | 'day' | 'week' | 'month';
  topics: boolean;
  country: string;
}

interface BookmarkedRepo {
  repository: Repository;
  bookmarkedAt: string;
  notes: string;
}

function App() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'search' | 'bookmarks'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    language: '',
    stars: 'any',
    forks: 'any',
    updated: 'any',
    topics: false,
    country: ''
  });
  const [bookmarks, setBookmarks] = useState<BookmarkedRepo[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const getDateFromDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const buildSearchQuery = useCallback(() => {
    let query = searchQuery;

    if (filters.language) {
      query += ` language:${filters.language}`;
    }

    if (filters.stars !== 'any') {
      const minStars = filters.stars === '100+' ? 100 : filters.stars === '1000+' ? 1000 : 10000;
      query += ` stars:>${minStars}`;
    }

    if (filters.forks !== 'any') {
      const minForks = filters.forks === '10+' ? 10 : filters.forks === '100+' ? 100 : 1000;
      query += ` forks:>${minForks}`;
    }

    if (filters.updated !== 'any') {
      const date = filters.updated === 'day' ? getDateFromDaysAgo(1) :
                   filters.updated === 'week' ? getDateFromDaysAgo(7) :
                   getDateFromDaysAgo(30);
      query += ` pushed:>${date}`;
    }

    if (filters.topics) {
      query += ' topics:>0';
    }

    if (filters.country) {
      // Country-specific search using location keywords
      const countryKeywords = {
        'US': 'USA OR United States',
        'UK': 'UK OR United Kingdom OR Britain',
        'CA': 'Canada',
        'DE': 'Germany OR Deutschland',
        'FR': 'France',
        'JP': 'Japan OR 日本',
        'CN': 'China OR 中国',
        'IN': 'India',
        'BR': 'Brazil',
        'AU': 'Australia',
        'RU': 'Russia',
        'ES': 'Spain',
        'IT': 'Italy',
        'KR': 'Korea OR 한국',
        'NL': 'Netherlands',
        'SE': 'Sweden',
        'NO': 'Norway',
        'DK': 'Denmark',
        'FI': 'Finland',
        'CH': 'Switzerland',
        'AT': 'Austria',
        'BE': 'Belgium',
        'IE': 'Ireland',
        'PL': 'Poland',
        'CZ': 'Czech Republic',
        'GR': 'Greece',
        'PT': 'Portugal',
        'MX': 'Mexico',
        'AR': 'Argentina',
        'CL': 'Chile',
        'CO': 'Colombia',
        'PE': 'Peru',
        'ZA': 'South Africa',
        'EG': 'Egypt',
        'NG': 'Nigeria',
        'KE': 'Kenya',
        'TH': 'Thailand',
        'VN': 'Vietnam',
        'PH': 'Philippines',
        'MY': 'Malaysia',
        'SG': 'Singapore',
        'ID': 'Indonesia',
        'NZ': 'New Zealand',
        'IL': 'Israel',
        'AE': 'UAE OR United Arab Emirates',
        'TR': 'Turkey',
        'SA': 'Saudi Arabia'
      };

      const keywords = countryKeywords[filters.country as keyof typeof countryKeywords];
      if (keywords) {
        query += ` ${keywords}`;
      }
    }

    return query || 'created:>' + getDateFromDaysAgo(30);
  }, [searchQuery, filters]);

  const fetchRepositories = useCallback(async (pageNum: number, query: string, sort: string = 'stars') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&page=${pageNum}&per_page=20`
      );

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        throw new Error(data.message);
      }

      setRepositories(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendingRepositories = useCallback(async (pageNum: number) => {
    const date = getDateFromDaysAgo(10);
    const query = `created:>${date}`;
    await fetchRepositories(pageNum, query, 'stars');
  }, [fetchRepositories]);

  const fetchRecentRepositories = useCallback(async (pageNum: number) => {
    const date = getDateFromDaysAgo(7);
    const query = `pushed:>${date}`;
    await fetchRepositories(pageNum, query, 'updated');
  }, [fetchRepositories]);

  const searchRepositories = useCallback(async (pageNum: number) => {
    const query = buildSearchQuery();
    await fetchRepositories(pageNum, query, 'stars');
  }, [buildSearchQuery, fetchRepositories]);

  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrendingRepositories(page);
    } else if (activeTab === 'recent') {
      fetchRecentRepositories(page);
    } else if (activeTab === 'search') {
      searchRepositories(page);
    } else if (activeTab === 'bookmarks') {
      const bookmarkedRepos = bookmarks.map(b => b.repository);
      setRepositories(bookmarkedRepos);
    }
  }, [page, activeTab, fetchTrendingRepositories, fetchRecentRepositories, searchRepositories, bookmarks]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const copyToClipboard = async (text: string, repoId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRepo(repoId);
      setTimeout(() => setCopiedRepo(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleBookmark = (repo: Repository) => {
    const existingBookmark = bookmarks.find(b => b.repository.id === repo.id);

    if (existingBookmark) {
      setBookmarks(bookmarks.filter(b => b.repository.id !== repo.id));
    } else {
      const newBookmark: BookmarkedRepo = {
        repository: repo,
        bookmarkedAt: new Date().toISOString(),
        notes: ''
      };
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const isBookmarked = (repoId: number) => {
    return bookmarks.some(b => b.repository.id === repoId);
  };

  const toggleRepoSelection = (repo: Repository) => {
    const isSelected = selectedRepos.some(r => r.id === repo.id);
    if (isSelected) {
      setSelectedRepos(selectedRepos.filter(r => r.id !== repo.id));
    } else {
      setSelectedRepos([...selectedRepos, repo]);
    }
  };

  const exportToMarkdown = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const markdown = selectedRepos.map(repo => {
      return `## [${repo.full_name}](${repo.html_url})

${repo.description || 'No description available'}

**Language:** ${repo.language || 'Unknown'}
**⭐ Stars:** ${repo.stargazers_count}
**🍴 Forks:** ${repo.forks_count}
**👁️ Watchers:** ${repo.watchers_count}
**🐛 Issues:** ${repo.open_issues_count}
**📅 Updated:** ${formatDate(repo.updated_at)}

**Clone Commands:**
\`\`\`bash
# HTTPS
git clone ${repo.clone_url}

# SSH
git clone ${repo.ssh_url}
\`\`\`

${repo.topics.length > 0 ? `**Topics:** ${repo.topics.map(tag => `\`${tag}\``).join(', ')}\n` : ''}
---
`;
    }).join('\n');

    const header = `# DevHub Explorer - Repository Report\n\n**Generated:** ${new Date().toLocaleDateString()}\n**Repositories:** ${selectedRepos.length}\n\n---\n\n`;

    const blob = new Blob([header + markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub-explorer-report-${currentDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const data = {
      generated: new Date().toISOString(),
      source: 'DevHub Explorer',
      count: selectedRepos.length,
      repositories: selectedRepos.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        issues: repo.open_issues_count,
        updated_at: repo.updated_at,
        topics: repo.topics,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        html_url: repo.html_url
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub-explorer-data-${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRepoSummary = () => {
    const currentDate = new Date().toLocaleDateString();

    const summary = selectedRepos.map(repo => {
      // Extract key insights from repo data
      const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const activityLevel = repo.stargazers_count > 1000 ? 'high' : repo.stargazers_count > 100 ? 'medium' : 'low';
      const hasTopics = repo.topics.length > 0;
      const isMaintained = daysSinceUpdate < 90; // Updated within last 3 months

      return `# ${repo.full_name}

${repo.description || 'No description available'}

## 📊 Repository Stats
- ⭐ **Stars**: ${formatNumber(repo.stargazers_count)}
- 🍴 **Forks**: ${formatNumber(repo.forks_count)}
- 👀️ **Watchers**: ${formatNumber(repo.watchers_count)}
- 🐛 **Issues**: ${repo.open_issues_count}
- 🏷️ **Activity**: ${activityLevel} activity level
- 📅 **Last Updated**: ${formatDate(repo.updated_at)} (${daysSinceUpdate} days ago)
- 📝 **Language**: ${repo.language || 'Not specified'}
${hasTopics ? `- 🏷️ Topics: ${repo.topics.slice(0, 5).join(', ')}${repo.topics.length > 5 ? ` +${repo.topics.length - 5} more` : ''}` : ''}

## 🔧 Technical Details
- **Repository**: [\`${repo.html_url}\`](${repo.html_url})
- **Clone Commands**:
\`\`\`bash
# HTTPS
git clone ${repo.clone_url}

# SSH
git clone ${repo.ssh_url}
\`\`\`
- **Default Branch**: \`${repo.default_branch}\`
- **License**: ${repo.license ? repo.license.name : 'No license'}
- **Repository Size**: ${repo.size ? `${(repo.size / 1024).toFixed(1)} KB` : 'Unknown'}

## 💡 Key Features
${isMaintained ? '✅ Actively maintained (updated recently)' : '⚠️ May not be actively maintained'}
${repo.forks_count > 10 ? '🔀 Strong community contribution (forks)' : ''}
${repo.stargazers_count > 1000 ? '🌟 High popularity' : repo.stargazers_count > 100 ? '📈 Growing popularity' : '📊 Emerging repository'}

${repo.topics.length > 3 ? `
## 🏷️ Topics
${repo.topics.map(topic => `- \`${topic}\``).join('\n')}
` : ''}

---
`;
    }).join('\n\n---\n');

    const summaryContent = `# GitHub Repository Summary

**Generated**: ${currentDate}
**Repositories Analyzed**: ${selectedRepos.length}

${summary}

## 📈 Analysis Summary

### Most Popular Repository
${selectedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 1).map(repo => `- **${repo.full_name}** (${formatNumber(repo.stargazers_count)} stars)`).join('\n')}

### Language Distribution
${Object.entries(
      selectedRepos.reduce((acc: Record<string, number>, repo) => {
        const lang = repo.language || 'Unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([lang, count]) => `- **${lang}**: ${count} repositories`).join('\n')}

### Activity Timeline
${selectedRepos
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map(repo => `- **${repo.full_name}**: Last updated ${formatDate(repo.updated_at)}`).join('\n')}
${selectedRepos.some(repo => (new Date().getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24) < 30) ? `
**Recent Activity Detected**: ${selectedRepos.filter(repo => (new Date().getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24) < 30).length} repositories have been updated in the last 30 days.` : ''}

### 📊 Repository Maturity
- **🔥 High Activity**: ${selectedRepos.filter(repo => repo.forks_count > 50 && repo.stargazers_count > 1000).length} repositories
- **📈 Growing**: ${selectedRepos.filter(repo => repo.forks_count > 10 && repo.stargazers_count > 100).length} repositories
- **🌱 Established**: ${selectedRepos.filter(repo => repo.forks_count > 5).length} repositories

---

*This summary was generated by [DevHub Explorer](http://localhost:5176/) using GitHub API data*`;

    const blob = new Blob([summaryContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-repo-summary-${currentDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    setPage(prev => prev + 1);
  };

  const handleTabChange = (tab: 'trending' | 'recent' | 'search' | 'bookmarks') => {
    setActiveTab(tab);
    setPage(1);
    setSelectedRepos([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || filters.language || filters.stars !== 'any' || filters.forks !== 'any' || filters.updated !== 'any' || filters.country) {
      setActiveTab('search');
      setPage(1);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="w-full max-w-6xl mx-auto px-4 pb-32">
        {/* Header */}
        <header className="pt-6 pb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-center">
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
              darkMode
                ? 'from-green-400 to-emerald-400'
                : 'from-green-600 to-emerald-600'
            }`}>
              DevHub Explorer
            </h1>
            <p className={`text-lg mt-1 font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Discover • Analyze • Export
            </p>
            <p className={`text-sm mt-2 ${
              darkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {activeTab === 'trending' && '🔥 Trending repositories from the last 10 days'}
              {activeTab === 'recent' && '🕒 Recently updated repositories'}
              {activeTab === 'search' && '🔍 Advanced search with filters'}
              {activeTab === 'bookmarks' && '📚 Your bookmarked repositories'}
            </p>
          </div>

          {/* Export Actions */}
          {selectedRepos.length > 0 && (
            <div className="mt-4 flex justify-center gap-2">
              <span className={`text-sm py-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {selectedRepos.length} selected
              </span>
              <button
                onClick={generateRepoSummary}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                Summary
              </button>
              <button
                onClick={exportToMarkdown}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Export MD
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <FileJson className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={() => setSelectedRepos([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          )}
        </header>

        {/* Search Bar */}
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="mb-6">
            <div className={`rounded-lg shadow-sm border p-4 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search repositories..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    showFilters
                      ? 'bg-green-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className={`grid grid-cols-1 md:grid-cols-5 gap-3 pt-3 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Language</label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Any</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="Go">Go</option>
                      <option value="Rust">Rust</option>
                      <option value="C++">C++</option>
                      <option value="Ruby">Ruby</option>
                      <option value="PHP">PHP</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Min Stars</label>
                    <select
                      value={filters.stars}
                      onChange={(e) => handleFilterChange('stars', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="any">Any</option>
                      <option value="100+">100+</option>
                      <option value="1000+">1,000+</option>
                      <option value="10000+">10,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Min Forks</label>
                    <select
                      value={filters.forks}
                      onChange={(e) => handleFilterChange('forks', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="any">Any</option>
                      <option value="10+">10+</option>
                      <option value="100+">100+</option>
                      <option value="1000+">1,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Updated</label>
                    <select
                      value={filters.updated}
                      onChange={(e) => handleFilterChange('updated', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="any">Any</option>
                      <option value="day">Last day</option>
                      <option value="week">Last week</option>
                      <option value="month">Last month</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Country</label>
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Any</option>
                      <option value="US">🇺🇸 United States</option>
                      <option value="UK">🇬🇧 United Kingdom</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="JP">🇯🇵 Japan</option>
                      <option value="CN">🇨🇳 China</option>
                      <option value="IN">🇮🇳 India</option>
                      <option value="BR">🇧🇷 Brazil</option>
                      <option value="AU">🇦🇺 Australia</option>
                      <option value="RU">🇷🇺 Russia</option>
                      <option value="ES">🇪🇸 Spain</option>
                      <option value="IT">🇮🇹 Italy</option>
                      <option value="KR">🇰🇷 South Korea</option>
                      <option value="NL">🇳🇱 Netherlands</option>
                      <option value="SE">🇸🇪 Sweden</option>
                      <option value="NO">🇳🇴 Norway</option>
                      <option value="DK">🇩🇰 Denmark</option>
                      <option value="FI">🇫🇮 Finland</option>
                      <option value="CH">🇨🇭 Switzerland</option>
                      <option value="AT">🇦🇹 Austria</option>
                      <option value="BE">🇧🇪 Belgium</option>
                      <option value="IE">🇮🇪 Ireland</option>
                      <option value="PL">🇵🇱 Poland</option>
                      <option value="CZ">🇨🇿 Czech Republic</option>
                      <option value="GR">🇬🇷 Greece</option>
                      <option value="PT">🇵🇹 Portugal</option>
                      <option value="MX">🇲🇽 Mexico</option>
                      <option value="AR">🇦🇷 Argentina</option>
                      <option value="CL">🇨🇱 Chile</option>
                      <option value="CO">🇨🇴 Colombia</option>
                      <option value="PE">🇵🇪 Peru</option>
                      <option value="ZA">🇿🇦 South Africa</option>
                      <option value="EG">🇪🇬 Egypt</option>
                      <option value="NG">🇳🇬 Nigeria</option>
                      <option value="KE">🇰🇪 Kenya</option>
                      <option value="TH">🇹🇭 Thailand</option>
                      <option value="VN">🇻🇳 Vietnam</option>
                      <option value="PH">🇵🇭 Philippines</option>
                      <option value="MY">🇲🇾 Malaysia</option>
                      <option value="SG">🇸🇬 Singapore</option>
                      <option value="ID">🇮🇩 Indonesia</option>
                      <option value="NZ">🇳🇿 New Zealand</option>
                      <option value="IL">🇮🇱 Israel</option>
                      <option value="AE">🇦🇪 UAE</option>
                      <option value="TR">🇹🇷 Turkey</option>
                      <option value="SA">🇸🇦 Saudi Arabia</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Error Display */}
        {error && (
          <div className={`mb-4 border-l-4 p-3 rounded ${
            darkMode
              ? 'bg-red-900/20 border-red-600'
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={darkMode ? 'text-red-400' : 'text-red-600'}>⚠️</span>
              <p className={`text-sm ${
                darkMode ? 'text-red-300' : 'text-red-700'
              }`}>{error}</p>
            </div>
          </div>
        )}

        {/* Repository Grid */}
        <div className="space-y-4">
          {repositories.map(repo => (
            <div
              key={repo.id}
              className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border overflow-hidden ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedRepos.some(r => r.id === repo.id)}
                      onChange={() => toggleRepoSelection(repo)}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className={`text-lg font-semibold truncate ${
                          darkMode
                            ? 'text-gray-100 hover:text-green-400'
                            : 'text-gray-900 hover:text-green-600'
                        }`}>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {repo.full_name}
                          </a>
                        </h2>
                        {repo.owner.type === 'Organization' && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            darkMode
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-green-100 text-green-700'
                          }`}>Org</span>
                        )}
                      </div>
                      <p className={`text-sm line-clamp-2 mb-2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {repo.description || 'No description available'}
                      </p>

                      {/* Topics */}
                      {repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {repo.topics.slice(0, 5).map(topic => (
                            <span
                              key={topic}
                              className={`px-2 py-1 text-xs rounded-full hover:opacity-80 ${
                                darkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {topic}
                            </span>
                          ))}
                          {repo.topics.length > 5 && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              darkMode
                                ? 'bg-gray-700 text-gray-400'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              +{repo.topics.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className={`flex flex-wrap items-center gap-4 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{formatNumber(repo.stargazers_count)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-4 h-4 text-green-500" />
                          <span>{formatNumber(repo.forks_count)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-green-500" />
                          <span>{formatNumber(repo.watchers_count)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-purple-500" />
                          <span>{repo.language || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(repo.updated_at)}</span>
                        </div>
                        {repo.license && (
                          <span className={`px-2 py-1 text-xs rounded ${
                            darkMode
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {repo.license.key.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex flex-wrap gap-2 pt-3 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <button
                    onClick={() => copyToClipboard(repo.clone_url, `${repo.id}-https`)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                      copiedRepo === `${repo.id}-https`
                        ? darkMode
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copiedRepo === `${repo.id}-https` ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        HTTPS
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(repo.ssh_url, `${repo.id}-ssh`)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                      copiedRepo === `${repo.id}-ssh`
                        ? darkMode
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copiedRepo === `${repo.id}-ssh` ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3 h-3" />
                        SSH
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => toggleBookmark(repo)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                      isBookmarked(repo.id)
                        ? darkMode
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : 'bg-yellow-100 text-yellow-700'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    {isBookmarked(repo.id) ? 'Saved' : 'Save'}
                  </button>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-green-500 border-t-transparent" />
          </div>
        )}

        {/* Pagination */}
        {!loading && repositories.length > 0 && (
          <div className="flex justify-center mt-8 mb-4">
            <div className={`inline-flex items-center rounded-lg shadow-md border ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`p-3 rounded-l-lg ${
                  page === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`px-6 py-3 text-sm font-medium border-x ${
                      darkMode
                        ? 'text-gray-300 border-gray-700'
                        : 'text-gray-700 border-gray-200'
                    }`}>
                Page {page}
              </span>
              <button
                onClick={handleNextPage}
                className={`p-3 rounded-r-lg ${
                  repositories.length < 20
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t ${
        darkMode
          ? 'bg-gray-900/90 border-gray-800'
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className={`max-w-6xl mx-auto grid grid-cols-4 divide-x ${
          darkMode
            ? 'divide-gray-700'
            : 'divide-gray-200'
        }`}>
          <button
            onClick={() => handleTabChange('trending')}
            className={`flex flex-col items-center justify-center gap-1 py-3 ${
              activeTab === 'trending'
                ? darkMode
                  ? 'text-white bg-green-900/50'
                  : 'text-green-600 bg-green-50/50'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-50/50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Trending</span>
          </button>
          <button
            onClick={() => handleTabChange('recent')}
            className={`flex flex-col items-center justify-center gap-1 py-3 ${
              activeTab === 'recent'
                ? darkMode
                  ? 'text-white bg-green-900/50'
                  : 'text-green-600 bg-green-50/50'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-50/50'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-xs font-medium">Recent</span>
          </button>
          <button
            onClick={() => handleTabChange('search')}
            className={`flex flex-col items-center justify-center gap-1 py-3 ${
              activeTab === 'search'
                ? darkMode
                  ? 'text-white bg-green-900/50'
                  : 'text-green-600 bg-green-50/50'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-50/50'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-10xs font-medium">Search</span>
          </button>
          <button
            onClick={() => handleTabChange('bookmarks')}
            className={`flex flex-col items-center justify-center gap-1 py-3 relative ${
              activeTab === 'bookmarks'
                ? darkMode
                  ? 'text-white bg-green-900/50'
                  : 'text-green-600 bg-green-50/50'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-50/50'
            }`}
          >
            <BookmarkPlus className="w-5 h-5" />
            <span className="text-xs font-medium">Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;