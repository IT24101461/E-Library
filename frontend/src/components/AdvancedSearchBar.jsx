import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Loader, X, Clock, Trash2, Filter, HelpCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvancedSearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Advanced Filters
  const [filters, setFilters] = useState({
    genre: '',
    author: '',
    minPages: '',
    maxPages: '',
    minRating: 0,
    fromYear: '',
    toYear: ''
  });

  // Get actual user ID from auth or use default
  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      const user = JSON.parse(raw);
      setAuthUser(user);
    }
  }, []);

  const USER_ID = authUser?.id || 1;

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

  const genreOptions = ['Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Horror', 'Thriller', 'Biography', 'History', 'Self-Help'];
  const authorOptions = ['Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Jane Austen', 'Mark Twain'];

  useEffect(() => {
    if (authUser) {
      fetchSearchHistory();
    }
  }, [authUser]);

  const fetchSearchHistory = async () => {
    if (!USER_ID) {
      console.warn("USER_ID not available yet");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/search-history/${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(Array.isArray(data) ? data : []);
      } else {
        console.warn(`Failed to fetch search history: ${response.status}`, response.statusText);
        setSearchHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch search history:", error);
      setSearchHistory([]);
    }
  };

  const saveSearchHistory = async (searchQuery) => {
    if (!USER_ID) {
      console.warn("USER_ID not available, cannot save search history");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, searchQuery })
      });
      
      if (!response.ok) {
        console.warn(`Failed to save search history: ${response.status}`, response.statusText);
      } else {
        fetchSearchHistory();
      }
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  const clearSearchHistory = async () => {
    if (!USER_ID) {
      console.warn("USER_ID not available, cannot clear search history");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/search-history/${USER_ID}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSearchHistory([]);
      } else {
        console.warn(`Failed to clear search history: ${response.status}`, response.statusText);
      }
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  // FEATURE 2: Generate suggestions based on input
  const generateSuggestions = (input) => {
    if (!input.trim()) {
      setSuggestions(popularSearches);
      return;
    }

    const filtered = popularSearches.filter(search =>
      search.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    generateSuggestions(value);
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
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResults([]);
    setShowHistory(false);
    setShowSuggestions(false);

    saveSearchHistory(searchQuery);

    // Parse advanced syntax
    const parsedQuery = parseAdvancedQuery(searchQuery);

    try {
      // Build filter params
      let filterParams = {
        title: searchQuery,
        description: searchQuery
      };

      if (filters.genre) filterParams.genre = filters.genre;
      if (filters.author) filterParams.author = filters.author;
      if (filters.minPages) filterParams.min_pages = filters.minPages;
      if (filters.maxPages) filterParams.max_pages = filters.maxPages;
      if (filters.minRating) filterParams.min_rating = filters.minRating;
      if (filters.fromYear) filterParams.from_year = filters.fromYear;
      if (filters.toYear) filterParams.to_year = filters.toYear;

      const response = await fetch('http://127.0.0.1:5000/api/recommend/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterParams)
      });

      const data = await response.json();
      
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

        // Limit to top 3
        setResults(filteredResults.slice(0, 3));
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Allow pressing "Enter" to search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto z-50">
      
      {/* The Search Bar & Filter Button */}
      <div className="flex gap-2 items-center">
        <div className={`flex-1 flex items-center bg-white border-2 rounded-full overflow-hidden transition-all shadow-sm ${isListening ? 'border-red-400 ring-4 ring-red-100' : 'border-indigo-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50'}`}>
          
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
            className="w-full py-4 bg-transparent outline-none text-slate-700 placeholder-slate-300 text-sm"
          />

          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSuggestions([]); }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          )}

          {/* The Voice Button */}
          <button 
            onClick={isListening ? null : startListening}
            className={`px-6 py-4 flex items-center gap-2 font-bold transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            {isListening ? 'Recording' : 'Voice'}
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-full transition-all ${showFilters ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          title="Advanced Filters"
        >
          <Filter size={20} />
        </button>

        {/* Query Syntax Help */}
        <div className="relative group">
          <button className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
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

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-40">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter size={20} className="text-indigo-600" />
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => setFilters({...filters, genre: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Genres</option>
                {genreOptions.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Author</label>
              <select
                value={filters.author}
                onChange={(e) => setFilters({...filters, author: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Authors</option>
                {authorOptions.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>

            {/* Pages Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Min Pages</label>
              <input
                type="number"
                value={filters.minPages}
                onChange={(e) => setFilters({...filters, minPages: e.target.value})}
                placeholder="e.g. 100"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Max Pages */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Max Pages</label>
              <input
                type="number"
                value={filters.maxPages}
                onChange={(e) => setFilters({...filters, maxPages: e.target.value})}
                placeholder="e.g. 500"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">From Year</label>
              <input
                type="number"
                value={filters.fromYear}
                onChange={(e) => setFilters({...filters, fromYear: e.target.value})}
                placeholder="2000"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* To Year */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">To Year</label>
              <input
                type="number"
                value={filters.toYear}
                onChange={(e) => setFilters({...filters, toYear: e.target.value})}
                placeholder="2024"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Min Rating */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Min Rating: {filters.minRating.toFixed(1)}⭐</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={() => {
              handleSearch();
              setShowFilters(false);
            }}
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Apply Filters & Search
          </button>
        </div>
      )}

      {/* The Dropdown Results */}
      {(loading || results.length > 0 || (showHistory && !query && searchHistory.length > 0) || (showSuggestions && suggestions.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-40">
          
          {loading && (
            <div className="p-6 flex items-center justify-center text-indigo-500 gap-3">
              <Loader className="animate-spin" size={20} />
              <span className="font-semibold">AI is scanning the library...</span>
            </div>
          )}

          {/* SEARCH SUGGESTIONS */}
          {!loading && showSuggestions && suggestions.length > 0 && query.length > 0 && (
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase px-2 mb-2">Suggestions</p>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-2 p-3 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-slate-700">{suggestion}</span>
                </div>
              ))}
            </div>
          )}

          {/* SEARCH HISTORY DROPDOWN */}
          {!loading && showHistory && !query && searchHistory.length > 0 && (
             <div className="max-h-96 overflow-y-auto p-2">
               <div className="flex items-center justify-between px-4 py-2">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</p>
                 <button onClick={clearSearchHistory} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors font-bold">
                   <Trash2 size={14} /> Clear
                 </button>
               </div>
               
               {searchHistory.map((historyItem) => (
                 <div 
                   key={historyItem.id}
                   onClick={() => {
                     setQuery(historyItem.searchQuery);
                     handleSearch(historyItem.searchQuery);
                   }}
                   className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                 >
                   <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                     <Clock size={16} />
                   </div>
                   <span className="text-slate-700 font-medium flex-1">{historyItem.searchQuery}</span>
                 </div>
               ))}
             </div>
          )}

          {/* AI MATCHES */}
          {!loading && results.length > 0 && query && (
            <div className="max-h-96 overflow-y-auto p-2">
              <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">⭐ Top Results</p>
              
              {results.map((book) => (
                <div 
                  key={book.id}
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <img 
                    src={book.cover_url} 
                    alt={book.title} 
                    className="w-12 h-16 object-cover rounded shadow-sm"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/48x64?text=No+Cover' }}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 line-clamp-1">{book.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
                  </div>
                  <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                    {book.match_score}% Match
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
