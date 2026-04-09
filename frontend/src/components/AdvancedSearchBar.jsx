import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Loader, X, Clock, Trash2, Filter, HelpCircle, Sparkles, Star, CalendarDays } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../config/ApiConfig';
import styles from './AdvancedSearchBar.module.css';
import SearchResultsModal from './SearchResultsModal';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const AdvancedSearchBar = ({ onResultsFound, onSearchStart, inlineMode = false }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    author: searchParams.get('author') || '',
    minRating: parseFloat(searchParams.get('minRating') || '0'),
    fromYear: searchParams.get('fromYear') || '',
    toYear: searchParams.get('toYear') || ''
  });

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
    
    // Load search history from localStorage only
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.warn("Failed to load search history:", e);
      }
    }

    // Listener for storage changes (for premium status updates)
    const handleStorageChange = () => {
      const updatedRaw = localStorage.getItem('authUser');
      if (updatedRaw) setAuthUser(JSON.parse(updatedRaw));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const USER_ID = authUser?.id || null;

  // Popular searches for suggestions
  const popularSearches = [
    'Mystery thriller',
    'Fantasy adventure',
    'Romantic comedy',
    'Science fiction',
    'Historical fiction',
    'Self-help books',
    'Biography',
    'Horror novels'
  ];

  const ERAS = [
    { label: 'All Time', from: '', to: '' },
    { label: '2020s', from: '2020', to: '2029' },
    { label: '2010s', from: '2010', to: '2019' },
    { label: '2000s', from: '2000', to: '2009' },
    { label: '90s & Older', from: '0', to: '1999' }
  ];

  useEffect(() => {
    if (authUser && searchParams.toString() && results.length === 0) {
      handleSearch(query, filters);
    }
  }, [authUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSearchHistory = async () => {
    // Already loaded in main useEffect, this is kept for compatibility
    if (!USER_ID) {
      console.warn("USER_ID not available yet");
      return;
    }

    try {
      const response = await fetch(`${API}/api/search-history/${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        const history = Array.isArray(data) ? data : [];
        setSearchHistory(history);
        localStorage.setItem('searchHistory', JSON.stringify(history));
      } else {
        console.warn(`Failed to fetch search history: ${response.status}`);
      }
    } catch (error) {
      console.warn("Error fetching search history:", error);
    }
  };

  const clearSearchHistory = async () => {
    // Clear from localStorage
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
    
    // Try to clear from database too
    try {
      if (USER_ID) {
        await fetch(`${API}/api/search-history/user/${USER_ID}`, {
          method: 'DELETE'
        });
      }
    } catch (e) {
      console.warn("Could not clear database history:", e);
    }
    console.log("Search history cleared");
  };

  // Save search to both localStorage and database
  const addToSearchHistory = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') return;
    
    const trimmedQuery = searchQuery.trim();
    
    // Save to localStorage (primary storage)
    const updated = [
      { searchQuery: trimmedQuery, timestamp: new Date().toISOString() },
      ...searchHistory.filter(h => h.searchQuery !== trimmedQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    
    // Save to database
    try {
      const user = JSON.parse(localStorage.getItem('authUser')) || authUser;
      if (user?.id) {
        const response = await fetch(`${API}/api/search-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            searchQuery: trimmedQuery
          })
        });
        if (!response.ok) {
          const errorData = await response.text();
          console.warn(`Failed to save search history (${response.status}):`, errorData);
        }
      }
    } catch (err) {
      console.warn('Failed to save search history to database:', err);
    }
  };

  const deleteHistoryItem = async (e, id, searchQuery) => {
    e.stopPropagation();
    
    // Remove from localStorage
    const updated = searchHistory.filter(h => h.searchQuery !== searchQuery);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    
    // Try to remove from database too (if id exists)
    if (id) {
      try {
        fetch(`${API}/api/search-history/item/${id}`, {
          method: 'DELETE'
        }).catch(err => console.warn("Could not delete from database:", err));
      } catch (error) {
        console.warn("Error deleting from database:", error);
      }
    }
  };

  // FEATURE 2: Generate suggestions based on input (including search history)
  const generateSuggestions = (input) => {
    if (!input.trim()) {
      // Show search history first, then popular searches
      const combined = [];
      
      // Add recent search history at the beginning
      if (searchHistory && searchHistory.length > 0) {
        searchHistory.slice(0, 5).forEach(history => {
          combined.push(history.searchQuery);
        });
      }
      
      // Add popular searches
      popularSearches.forEach(search => {
        if (!combined.includes(search)) {
          combined.push(search);
        }
      });
      
      setSuggestions(combined);
      return;
    }

    // Combine popularSearches and search history, then filter
    const combined = [...popularSearches];
    
    // Add search history items that match
    if (searchHistory && searchHistory.length > 0) {
      searchHistory.forEach(history => {
        const searchQuery = history.searchQuery || history;
        if (!combined.includes(searchQuery) && searchQuery.toLowerCase().includes(input.toLowerCase())) {
          combined.unshift(searchQuery); // Add history items at the beginning
        }
      });
    }

    const filtered = combined.filter(search =>
      search.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHasSearched(false);
    
    // Clear results when search bar is emptied
    if (!value.trim()) {
      setResults([]);
      setShowModal(false);
      // Also clear inline mode results
      if (inlineMode && onResultsFound) {
        onResultsFound([], '');
      }
    }
    
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    const newTimeout = setTimeout(() => {
      generateSuggestions(value);
    }, 300);
    setDebounceTimeout(newTimeout);
    
    setShowSuggestions(true);
  };

  // FEATURE 7: Parse advanced query syntax
  const parseAdvancedQuery = (queryString) => {
    const queryObj = {
      include: [],
      exclude: [],
      exact: null
    };

    // Extract exact phrase: "exact text"
    const exactMatch = queryString.match(/"([^"]+)"/);
    if (exactMatch) {
      queryObj.exact = exactMatch[1];
      queryString = queryString.replace(/"[^"]+"/g, '').trim();
    }

    // Split by OR
    const orTerms = queryString.split(/\bOR\b/i).map(t => t.trim());
    
    if (orTerms.length > 1) {
      queryObj.include = orTerms;
    } else {
      // Extract excluded terms: -word
      const parts = queryString.split(/\s+/);
      parts.forEach(part => {
        if (part.startsWith('-')) {
          queryObj.exclude.push(part.substring(1));
        } else {
          queryObj.include.push(part);
        }
      });
    }

    return queryObj;
  };

  // --- 1. THE VOICE RECOGNITION MAGIC ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Search. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- 2. TALKING TO YOUR FLASK AI ---
  const handleSearch = async (searchQuery = query, currentFilters = filters) => {
    if (!searchQuery.trim() && Object.values(currentFilters).every(val => !val || val === 0)) return;

    // Save to search history
    if (searchQuery.trim()) {
      await addToSearchHistory(searchQuery);
    }

    setLoading(true);
    if (onSearchStart) onSearchStart();
    setResults([]);
    setShowHistory(false);
    setShowSuggestions(false);
    setHasSearched(true);

    // Update URL params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value !== 0) newParams.set(key, value);
    });
    setSearchParams(newParams);

    // Format query with filters for history
    let filterStrItems = [];
    if (currentFilters.author) filterStrItems.push(`Auth: ${currentFilters.author}`);
    if (currentFilters.minRating > 0) filterStrItems.push(`${currentFilters.minRating}+⭐`);
    if (currentFilters.fromYear && currentFilters.toYear) filterStrItems.push(`${currentFilters.fromYear}s`);
    
    let historyStr = searchQuery;
    if (filterStrItems.length > 0) {
      if (!historyStr) {
         historyStr = `Filters Only (${filterStrItems.join(', ')})`;
      } else {
         historyStr += ` (${filterStrItems.join(', ')})`;
      }
    }
    // Save search to history
    if (historyStr) {
      await addToSearchHistory(historyStr);
    }
    const parsedQuery = parseAdvancedQuery(searchQuery);
    let data = null; // Declare outside try block

    try {
      // Build filter params
      let filterParams = {
        title: searchQuery,
        description: searchQuery
      };

      if (currentFilters.author) filterParams.author = currentFilters.author;
      if (currentFilters.minRating) filterParams.min_rating = currentFilters.minRating;
      if (currentFilters.fromYear) filterParams.from_year = currentFilters.fromYear;
      if (currentFilters.toYear) filterParams.to_year = currentFilters.toYear;

      const mlUrl = getApiUrl().replace(':8080', ':5000');
      const response = await fetch(`${mlUrl}/recommend/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterParams)
      });

      data = await response.json();
      
      if (data.recommendations) {
        let filteredResults = data.recommendations;

        // Apply advanced query syntax
        if (parsedQuery.exact) {
          filteredResults = filteredResults.filter(book =>
            book.title?.toLowerCase().includes(parsedQuery.exact.toLowerCase()) ||
            book.author?.toLowerCase().includes(parsedQuery.exact.toLowerCase())
          );
        }

        // Exclude terms
        if (parsedQuery.exclude.length > 0) {
          filteredResults = filteredResults.filter(book => {
            return !parsedQuery.exclude.some(excluded =>
              book.title?.toLowerCase().includes(excluded.toLowerCase()) ||
              book.author?.toLowerCase().includes(excluded.toLowerCase())
            );
          });
        }

        // Limit to top 20 like in the Bookshelf
        setResults(filteredResults.slice(0, 20));
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
      generateSuggestions(searchQuery); // Generate suggestions to show in modal
      
      if (inlineMode && onResultsFound) {
        onResultsFound(data?.recommendations || [], searchQuery);
      } else {
        setShowModal(true);
      }
    }
  };

  // Allow pressing "Enter" to search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch(query, filters);
  };

  return (
    <div className={styles['advanced-search-container']}>
      
      {/* The Search Bar & Filter Button */}
      <div className="flex gap-2 items-center">
        <div className={`${styles['search-input-wrapper']} flex-1 flex items-center overflow-hidden`}>
          
          <div className="pl-4 pr-2 text-slate-400">
            <Search size={20} />
          </div>
          
          <input 
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              setShowHistory(true);
              if (query.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => {
              setShowHistory(false);
              setShowSuggestions(false);
            }, 200)}
            placeholder={isListening ? "Listening to your voice..." : "Search: Harry OR Percy | -romance | \"exact title\""}
            className={styles['search-input']}
          />

          {query && (
            <button onClick={() => { 
                setQuery(''); 
                setResults([]); 
                setSuggestions([]); 
                setHasSearched(false);
                setShowHistory(true);
              }} 
              className={`${styles['control-button']} pr-2`}
            >
              <X size={18} />
            </button>
          )}

          {/* The Voice Button with Neural Pulse */}
          <div className={`${styles['voice-container']} ${isListening ? styles['listening'] : ''}`}>
            {isListening && <div className={styles['wave-pulse']}></div>}
            <button 
              onClick={isListening ? null : startListening}
              className={`${styles['voice-button']} ${isListening ? styles['active'] : ''}`}
            >
              {isListening ? (
                <div className={styles['listening-dots']}>
                  <span></span><span></span><span></span>
                </div>
              ) : <Mic size={22} />}
            </button>
          </div>
        </div>

        {/* History Toggle Button */}
        {searchHistory.length > 0 && (
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory && query) setQuery('');
            }}
            className={`${styles['control-button']} ${showHistory ? styles['active'] : ''}`}
            title="Search History"
          >
            <Clock size={20} />
          </button>
        )}

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles['control-button']} ${showFilters ? styles['active'] : ''} relative`}
          title="Advanced Filters"
        >
          <Filter size={20} />
          {/* Notification Dot if filters are active */}
          {!showFilters && (filters.author || filters.minRating > 0 || filters.fromYear) && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 border-2 border-white rounded-full"></span>
          )}
        </button>

        {/* Query Syntax Help */}
        <div className="relative group">
          <button className={styles['control-button']}>
            <HelpCircle size={20} />
          </button>
          <div className="absolute bottom-full right-0 mb-2 bg-slate-900 text-white text-xs p-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <p className="font-bold mb-1">Query Syntax:</p>
            <p>•  OR: search1 OR search2</p>
            <p>•  Exclude: -word</p>
            <p>•  Exact: "exact phrase"</p>
          </div>
        </div>
      </div>
      
      {/* Search Suggestions & History Dropdown */}
      {(showHistory || showSuggestions) && (searchHistory.length > 0 || suggestions.length > 0) && (
        <div className={styles['suggestions-dropdown']}>
          {/* History Section */}
          {searchHistory.length > 0 && showHistory && !query && (
            <>
              <div className={styles['dropdown-header']}>Recent Searches</div>
              {searchHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={styles['suggestion-item']}
                  onMouseDown={() => {
                    setQuery(item.searchQuery);
                    handleSearch(item.searchQuery, filters);
                  }}
                >
                  <Clock size={16} className={styles['suggestion-icon']} />
                  <span className={styles['suggestion-text']}>{item.searchQuery}</span>
                  <button 
                    className={styles['suggestion-delete']}
                    onMouseDown={(e) => deleteHistoryItem(e, item.id, item.searchQuery)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* AI Suggestions Section */}
          {suggestions.length > 0 && showSuggestions && query && (
            <>
              <div className={styles['dropdown-header']}>AI Power suggestions</div>
              {suggestions.map((text, idx) => (
                <div 
                  key={idx} 
                  className={styles['suggestion-item']}
                  onMouseDown={() => {
                    setQuery(text);
                    handleSearch(text, filters);
                  }}
                >
                  <Sparkles size={16} className={styles['suggestion-icon']} />
                  <span className={styles['suggestion-text']}>{text}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 z-40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Filter size={20} className="text-indigo-600" />
              Premium Filters
              {!authUser?.isPremium && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">💎 LOCKED</span>}
            </h3>
            
            {(filters.author || filters.minRating > 0 || filters.fromYear) && (
              <button
                onClick={() => {
                  setFilters({ author: '', minRating: 0, fromYear: '', toYear: '' });
                  setSearchParams(new URLSearchParams());
                  setResults([]);
                  setHasSearched(false);
                  setQuery('');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
          
          <div className={`space-y-6 relative ${!authUser?.isPremium ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
            {/* Lock Overlay for non-premium */}
            {!authUser?.isPremium && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-white/10 backdrop-blur-[2px] rounded-xl">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-amber-100 flex flex-col items-center gap-3 animate-bounce">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Premium Scholar Feature</p>
                    <p className="text-xs text-slate-500">Upgrade to unlock advanced AI-powered filters.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Minimum Rating (Interactive Stars) */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Minimum Rating
               </label>
               <div className="flex gap-1 bg-slate-50/50 p-2 rounded-xl inline-flex border border-slate-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFilters({ ...filters, minRating: filters.minRating === star ? 0 : star })}
                      className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${filters.minRating >= star ? 'text-amber-400 bg-amber-50/50' : 'text-slate-300 hover:text-amber-200'}`}
                    >
                      <Star size={24} fill={filters.minRating >= star ? "currentColor" : "none"} strokeWidth={2} />
                    </button>
                  ))}
                  {filters.minRating > 0 && <span className="ml-2 py-2 text-sm font-bold text-amber-600">{filters.minRating}.0+</span>}
               </div>
            </div>

            {/* Publication Era (Cinematic Chips) */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <CalendarDays size={16} className="text-indigo-500" /> Publication Era
               </label>
               <div className="flex flex-wrap gap-2">
                  {ERAS.map((era, idx) => {
                    const isActive = (filters.fromYear === era.from && filters.toYear === era.to);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFilters({ ...filters, fromYear: era.from, toYear: era.to })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                          isActive 
                            ? 'bg-indigo-600 outline-none ring-2 ring-indigo-200 text-white shadow-lg shadow-indigo-200/50 scale-105' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md'
                        }`}
                      >
                        {era.label}
                      </button>
                    );
                  })}
               </div>
            </div>

            {/* Author Search (Sleek Input) */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Search size={16} className="text-pink-500" /> Specific Author
               </label>
               <input
                 type="text"
                 value={filters.author}
                 onChange={(e) => setFilters({...filters, author: e.target.value})}
                 placeholder="e.g. Stephen King, Jane Austen..."
                 className="w-full p-3 bg-white/50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-slate-400"
               />
            </div>
          </div>

          <button
            onClick={() => {
              handleSearch(query, filters);
              setShowFilters(false);
            }}
            className={styles['apply-btn']}
          >
            <Sparkles size={18} />
            Scan Library with AI
          </button>
        </div>
      )}

{/* Search Results Modal */}
      {!inlineMode && (
        <SearchResultsModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          results={results}
          suggestions={suggestions}
          searchHistory={searchHistory}
          query={query}
          loading={loading}
          onSelectBook={(book) => {
            // If it's a search term (from history/suggestions), perform a new search
            if (book.searchTerm) {
              setQuery(book.searchTerm);
              handleSearch(book.searchTerm, filters);
            } 
            // Otherwise it's a book, open the book details
            else if (book.id) {
              navigate(`/books/${book.id}`);
              setShowModal(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdvancedSearchBar;
