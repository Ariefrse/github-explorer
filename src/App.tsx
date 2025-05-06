import React, { useState, useEffect, useCallback } from 'react';
import { Star, User, TrendingUp, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

function App() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending');

  const getDateFromDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const fetchTrendingRepositories = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const date = getDateFromDaysAgo(10);
      const response = await fetch(
        `https://api.github.com/search/repositories?q=created:>${date}&sort=stars&order=desc&page=${pageNum}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentRepositories = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const date = getDateFromDaysAgo(1);
      const response = await fetch(
        `https://api.github.com/search/repositories?q=created:>${date}&sort=updated&order=desc&page=${pageNum}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrendingRepositories(page);
    } else {
      fetchRecentRepositories(page);
    }
  }, [page, activeTab, fetchTrendingRepositories, fetchRecentRepositories]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    setPage(prev => prev + 1);
  };

  const handleTabChange = (tab: 'trending' | 'recent') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-3xl mx-auto px-4 pb-24">
        <header className="pt-6 pb-8">
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            GitHub Explorer
          </h1>
          <p className="text-sm text-center text-gray-600 mt-2">
            {activeTab === 'trending' 
              ? 'Most starred repos from the last 10 days' 
              : 'Recently updated repositories'}
          </p>
        </header>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {repositories.map(repo => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 p-4 border border-gray-100"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900 hover:text-blue-600 truncate">
                    {repo.name}
                  </h2>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {repo.description || 'No description available'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center min-w-0 flex-1">
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-6 h-6 rounded-full ring-2 ring-gray-100"
                    />
                    <span className="ml-2 text-sm text-gray-700 truncate">
                      {repo.owner.login}
                    </span>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-sm text-yellow-700">
                      {formatNumber(repo.stargazers_count)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent" />
          </div>
        )}

        <div className="flex justify-center mt-6 mb-4">
          <div className="inline-flex items-center bg-white rounded-lg shadow-md border border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              className={`p-3 ${
                page === 1 || loading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-6 py-3 text-sm font-medium text-gray-700 border-x border-gray-200">
              Page {page}
            </span>
            <button
              onClick={handleNextPage}
              disabled={loading}
              className={`p-3 ${
                loading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-md mx-auto grid grid-cols-2 divide-x divide-gray-200">
          <button
            onClick={() => handleTabChange('trending')}
            className={`flex items-center justify-center gap-2 py-3 ${
              activeTab === 'trending'
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Trending</span>
          </button>
          <button
            onClick={() => handleTabChange('recent')}
            className={`flex items-center justify-center gap-2 py-3 ${
              activeTab === 'recent'
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Recent</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;