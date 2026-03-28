// ============================================================
// AdvancedSearch.jsx — Advanced Search & Filtering Module
// e-Library Project | IT2150 | DS 2.2 G17
// Matches Bookshelf.css dark theme exactly
// Features: Voice Search, Voice Feedback, Toast, Skeleton Cards
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "./Bookshelf.css";

axios.defaults.withCredentials = true;

const API_BASE     = "http://localhost:8080/api/bookshelf";
const HISTORY_BASE = "http://localhost:8080/api/search-history";

const GENRE_OPTIONS = [
  "Fiction","Non-Fiction","Fantasy","Sci-Fi",
  "Mystery","Thriller","Romance","Horror",
  "Biography","History","Self-Help","Children",
];

const SORT_OPTIONS = [
  { value: "title",  label: "Title (A → Z)" },
  { value: "author", label: "Author (A → Z)" },
  { value: "year",   label: "Year (Newest first)" },
];

const DEFAULT_FILTERS = {
  q: "", author: "", yearMin: "", yearMax: "", genres: [], sort: "title",
};

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Voice Search Hook ─────────────────────────────────────────
function useVoiceSearch(onResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const start = useCallback(() => {
    if (!SpeechRecognition) return alert("Voice search is not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed") alert("Microphone access denied. Please allow it in your browser settings.");
    };
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("").replace(/[.!?,]+$/, "").trim();
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognition, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { listening, start, stop };
}

// ── Voice Feedback (speaks back the search term) ─────────────
function speakFeedback(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(`Searching for ${text}`);
  utter.lang   = "en-US";
  utter.rate   = 1.05;
  utter.pitch  = 1;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

// ── Toast Notification ────────────────────────────────────────
function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(() => onDone(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return createPortal(
    <div style={{
      position: "fixed",
      bottom: 32,
      left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : "12px"})`,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.35s ease, transform 0.35s ease",
      background: "rgba(12,18,30,0.97)",
      border: "1px solid rgba(0,229,255,0.3)",
      borderRadius: 12,
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.08)",
      backdropFilter: "blur(16px)",
      zIndex: 999999,
      pointerEvents: "none",
      minWidth: 220,
      maxWidth: 360,
    }}>
      <span style={{ fontSize: 18 }}>🎙️</span>
      <span style={{
        color: "#c8d4f0",
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {message}
      </span>
    </div>,
    document.body
  );
}

// ── Skeleton Book Card ────────────────────────────────────────
function SkeletonCard({ index }) {
  return (
    <div className="book-card" style={{ animationDelay: `${index * 0.06}s`, cursor: "default" }}>
      <div className="book-cover">
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
          backgroundSize: "200% 100%",
          animation: "skeletonShimmer 1.4s infinite",
          borderRadius: 8,
        }} />
      </div>
      <div className="book-info" style={{ gap: 8 }}>
        <div style={{
          height: 14, borderRadius: 6, width: "80%",
          background: "rgba(255,255,255,0.07)",
          animation: "skeletonShimmer 1.4s infinite",
          backgroundSize: "200% 100%",
        }} />
        <div style={{
          height: 11, borderRadius: 6, width: "55%",
          background: "rgba(255,255,255,0.05)",
          animation: "skeletonShimmer 1.4s infinite 0.2s",
          backgroundSize: "200% 100%",
        }} />
        <div style={{
          height: 10, borderRadius: 6, width: "35%",
          background: "rgba(255,255,255,0.04)",
          animation: "skeletonShimmer 1.4s infinite 0.4s",
          backgroundSize: "200% 100%",
        }} />
      </div>
    </div>
  );
}

// ── Book Card (dark theme) ────────────────────────────────────
function BookCard({ book, index }) {
  const [imgError, setImgError] = useState(false);
  const colors = [
    "linear-gradient(160deg,#1a3a5c,#0a1628)",
    "linear-gradient(160deg,#2d1b4e,#1a0a2e)",
    "linear-gradient(160deg,#1a3a2a,#0a1e14)",
    "linear-gradient(160deg,#3a1a1a,#1e0a0a)",
    "linear-gradient(160deg,#2a2a1a,#1a1a0a)",
    "linear-gradient(160deg,#1a2a3a,#0a141e)",
  ];
  const bg = colors[index % colors.length];

  return (
    <div className="book-card" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="book-cover">
        {book.coverImage && !imgError ? (
          <img
            src={book.coverImage}
            alt={book.title}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="cover-placeholder" style={{ background: bg }}>
            <span style={{ fontSize: 38 }}>{book.emoji || "📚"}</span>
            <span className="cover-title">{book.title}</span>
          </div>
        )}
        <div className="cover-gradient" />
        {book.publicationYear && (
          <div style={{
            position:"absolute", bottom:8, left:8,
            fontSize:10, fontWeight:700, letterSpacing:".06em",
            padding:"2px 7px", borderRadius:5,
            background:"rgba(0,229,255,0.15)",
            border:"1px solid rgba(0,229,255,0.25)",
            color:"#00e5ff",
          }}>
            {book.publicationYear}
          </div>
        )}
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author || "Unknown Author"}</div>
        <div className="book-meta">
          {book.genre && <span className="book-genre-tag">{book.genre}</span>}
          {book.rating > 0 && (
            <span className="book-rating-mini">
              ★ <span>{book.rating}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Search History Dropdown (rendered via portal to escape overflow:auto) ──
function SearchHistoryDropdown({ anchorRef, history, onSelect, onRemove, onClearAll, onEdit }) {
  const [rect, setRect]           = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef              = useRef(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const update = () => {
      const r = anchorRef.current.getBoundingClientRect();
      setRect(r);
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEdit = (e, item) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditValue(item.searchQuery);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditValue("");
  };

  const confirmEdit = (e, id) => {
    e?.stopPropagation();
    const trimmed = editValue.trim();
    if (trimmed) onEdit(id, trimmed);
    setEditingId(null);
    setEditValue("");
  };

  if (!rect) return null;

  const style = {
    ...dropdownStyles.container,
    position: "fixed",
    top: rect.bottom + 6,
    left: rect.left,
    width: rect.width,
  };

  const content = history.length === 0 ? (
    <div style={style}>
      <div style={dropdownStyles.emptyRow}>
        <span style={{ fontSize: 22, marginBottom: 4 }}>🕐</span>
        <span style={{ color: "#8896b0", fontSize: 13 }}>No recent searches</span>
      </div>
    </div>
  ) : (
    <div style={style}>
      <div style={dropdownStyles.header}>
        <span style={{ fontSize: 11, color: "#8896b0", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase" }}>
          Recent Searches
        </span>
        <button
          style={dropdownStyles.clearAllBtn}
          onMouseEnter={e => e.currentTarget.style.color = "#ff6b85"}
          onMouseLeave={e => e.currentTarget.style.color = "#ff4d6d"}
          onClick={e => { e.stopPropagation(); onClearAll(); }}
        >
          Clear all
        </button>
      </div>
      <div style={{ maxHeight: 240, overflowY: "auto" }}>
        {history.map(item => (
          <div
            key={item.id}
            style={{
              ...dropdownStyles.item,
              background: editingId === item.id ? "rgba(0,229,255,0.06)" : "transparent",
              cursor: editingId === item.id ? "default" : "pointer",
            }}
            onMouseEnter={e => { if (editingId !== item.id) e.currentTarget.style.background = "rgba(0,229,255,0.06)"; }}
            onMouseLeave={e => { if (editingId !== item.id) e.currentTarget.style.background = "transparent"; }}
            onClick={() => { if (editingId !== item.id) onSelect(item.searchQuery); }}
          >
            <span style={{ fontSize: 14, color: "#8896b0", flexShrink: 0 }}>
              {editingId === item.id ? "✏️" : "🕐"}
            </span>

            {/* Inline edit input OR normal text */}
            {editingId === item.id ? (
              <input
                ref={editInputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter")  confirmEdit(e, item.id);
                  if (e.key === "Escape") cancelEdit(e);
                }}
                onClick={e => e.stopPropagation()}
                style={{
                  flex: 1,
                  background: "rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.35)",
                  borderRadius: 6,
                  color: "#e8f0ff",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  padding: "3px 8px",
                  outline: "none",
                  minWidth: 0,
                }}
              />
            ) : (
              <span style={dropdownStyles.itemText}>{item.searchQuery}</span>
            )}

            {/* Edit mode: confirm ✓ and cancel ✕ */}
            {editingId === item.id ? (
              <>
                <button
                  style={{ ...dropdownStyles.removeBtn, color: "#00e5ff" }}
                  onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.background = "rgba(0,229,255,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  onClick={e => confirmEdit(e, item.id)}
                  title="Save"
                >
                  ✓
                </button>
                <button
                  style={dropdownStyles.removeBtn}
                  onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = "#ff4d6d"; e.currentTarget.style.background = "rgba(255,77,109,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(150,160,190,0.7)"; e.currentTarget.style.background = "transparent"; }}
                  onClick={cancelEdit}
                  title="Cancel"
                >
                  ✕
                </button>
              </>
            ) : (
              /* Normal mode: edit ✏️ and delete ✕ */
              <>
                <button
                  style={{ ...dropdownStyles.removeBtn, color: "rgba(150,160,190,0.7)" }}
                  onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = "#00e5ff"; e.currentTarget.style.background = "rgba(0,229,255,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(150,160,190,0.7)"; e.currentTarget.style.background = "transparent"; }}
                  onClick={e => startEdit(e, item)}
                  title="Edit this search"
                >
                  ✏️
                </button>
                <button
                  style={dropdownStyles.removeBtn}
                  onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = "#ff4d6d"; e.currentTarget.style.background = "rgba(255,77,109,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(150,160,190,0.7)"; e.currentTarget.style.background = "transparent"; }}
                  onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                  title="Remove this search"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div id="search-history-portal">{content}</div>,
    document.body
  );
}

const dropdownStyles = {
  container: {
    background: "rgba(12, 18, 30, 0.98)",
    border: "1px solid rgba(0,229,255,0.18)",
    borderRadius: 12,
    boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.06)",
    backdropFilter: "blur(16px)",
    overflow: "hidden",
    animation: "fadeSlideDown 0.15s ease",
    zIndex: 99999,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  clearAllBtn: {
    background: "none",
    border: "none",
    cursor: "pointer !important",
    color: "#ff4d6d",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    padding: "2px 6px",
    borderRadius: 4,
    transition: "color .15s",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    cursor: "pointer !important",
    transition: "background .15s",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: "#c8d4f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer !important",
    color: "rgba(150,160,190,0.7)",
    fontSize: 11,
    fontWeight: 700,
    width: 22,
    height: 22,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "color .15s, background .15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "22px 14px",
    gap: 6,
  },
};

// ── Main Component ────────────────────────────────────────────
export default function AdvancedSearch() {
  const [filters, setFilters]             = useState(DEFAULT_FILTERS);
  const [books, setBooks]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [searched, setSearched]           = useState(false);
  const [yearError, setYearError]         = useState(null);

  // Search history state
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory]     = useState(false);
  const searchWrapRef                     = useRef(null);

  // Toast state
  const [toast, setToast]                 = useState(null);

  const debouncedQ      = useDebounce(filters.q);
  const debouncedAuthor = useDebounce(filters.author);

  // ── Fetch search history ──────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(`${HISTORY_BASE}/recent`);
      setSearchHistory(data);
    } catch {
      // silently fail — history is non-critical
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Close dropdown when clicking outside ─────────────────
  useEffect(() => {
    const handler = e => {
      // Also ignore clicks inside the portal dropdown (rendered outside DOM tree)
      const portalDropdown = document.getElementById("search-history-portal");
      if (
        searchWrapRef.current && !searchWrapRef.current.contains(e.target) &&
        !(portalDropdown && portalDropdown.contains(e.target))
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Remove single history item ────────────────────────────
  const handleRemoveHistoryItem = async (id) => {
    try {
      await axios.delete(`${HISTORY_BASE}/${id}`);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
    } catch {
      // silently fail
    }
  };

  // ── Clear all history ─────────────────────────────────────
  const handleClearAllHistory = async () => {
    try {
      await axios.delete(`${HISTORY_BASE}/clear-all`);
      setSearchHistory([]);
    } catch {
      // silently fail
    }
  };

  // ── Edit a history item ──────────────────────────────────
  const handleEditHistoryItem = async (id, newQuery) => {
    try {
      await axios.put(`${HISTORY_BASE}/${id}`, { searchQuery: newQuery });
      setSearchHistory(prev =>
        prev.map(item => item.id === id ? { ...item, searchQuery: newQuery } : item)
      );
      setToast(`Updated: "${newQuery}"`);
    } catch {
      // silently fail
    }
  };

  // ── Select a history item ─────────────────────────────────
  const handleSelectHistory = (query) => {
    setFilters(prev => ({ ...prev, q: query }));
    setShowHistory(false);
  };

  // ── Fetch books ───────────────────────────────────────────
  const fetchBooks = useCallback(async (f, dQ, dAuthor) => {
    if (f.yearMin !== "" && f.yearMax !== "" && Number(f.yearMin) > Number(f.yearMax)) {
      setYearError("Please try again — max year should be greater than min year.");
      setBooks([]);
      return;
    }
    setYearError(null);
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dQ)               params.append("q",       dQ);
      if (dAuthor)          params.append("author",  dAuthor);
      if (f.yearMin !== "") params.append("yearMin", f.yearMin);
      if (f.yearMax !== "") params.append("yearMax", f.yearMax);
      f.genres.forEach(g => params.append("genre", g));
      params.append("sort", f.sort);
      const { data } = await axios.get(`${API_BASE}/search?${params.toString()}`);
      setBooks(data);
      setSearched(true);
      if (dQ || dAuthor) fetchHistory();
    } catch {
      setError("Failed to load results. Is the backend running on port 8080?");
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  useEffect(() => {
    fetchBooks(filters, debouncedQ, debouncedAuthor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBooks, debouncedQ, debouncedAuthor, filters.yearMin, filters.yearMax, filters.genres, filters.sort]);

  const setField = field => e => setFilters(prev => ({ ...prev, [field]: e.target.value }));

  const toggleGenre = genre =>
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));

  const clearAll = () => { setFilters(DEFAULT_FILTERS); setYearError(null); };

  const hasActive = filters.q || filters.author || filters.yearMin || filters.yearMax || filters.genres.length > 0;

  // ── Voice search ──────────────────────────────────────────
  const handleVoiceResult = useCallback((transcript) => {
    setFilters(prev => ({ ...prev, q: transcript }));
    setToast(`Heard: "${transcript}"`);
    speakFeedback(transcript);
  }, []);

  const { listening, start: startVoice, stop: stopVoice } = useVoiceSearch(handleVoiceResult);

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        #search-history-portal * {
          cursor: pointer !important;
        }
        #search-history-portal input {
          cursor: text !important;
        }
      `}</style>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast}
          onDone={() => setToast(null)}
        />
      )}

      {/* ── Main Layout ── */}
      <div className="main-layout">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Filters</div>
            {SORT_OPTIONS.map(opt => (
              <div
                key={opt.value}
                className={`sidebar-item${filters.sort === opt.value ? " active" : ""}`}
                onClick={() => setFilters(prev => ({ ...prev, sort: opt.value }))}
              >
                <span className="icon">
                  {opt.value === "title" ? "🔤" : opt.value === "author" ? "👤" : "📅"}
                </span>
                {opt.label}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Genres</div>
            {GENRE_OPTIONS.map(g => (
              <div
                key={g}
                className={`sidebar-item genre-pill${filters.genres.includes(g) ? " active" : ""}`}
                onClick={() => toggleGenre(g)}
              >
                <span className="icon">
                  {filters.genres.includes(g) ? "✓" : "·"}
                </span>
                {g}
                {filters.genres.includes(g) && (
                  <span className="count">✓</span>
                )}
              </div>
            ))}
          </div>

          {hasActive && (
            <div className="sidebar-section">
              <button
                onClick={clearAll}
                style={{
                  width:"100%", padding:"9px 0",
                  background:"rgba(255,77,109,0.1)",
                  border:"1px solid rgba(255,77,109,0.3)",
                  borderRadius:8, color:"#ff4d6d",
                  fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600, fontSize:13,
                  transition:"all .22s cubic-bezier(.4,0,.2,1)",
                  cursor:"none",
                }}
                onMouseEnter={e => { e.target.style.background="rgba(255,77,109,0.2)"; }}
                onMouseLeave={e => { e.target.style.background="rgba(255,77,109,0.1)"; }}
              >
                ✕ Clear All Filters
              </button>
            </div>
          )}
        </aside>

        {/* ── Content ── */}
        <main className="content">

          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Advanced Search</h1>
              <p className="page-subtitle">
                {searched && !loading
                  ? `Found ${books.length} book${books.length !== 1 ? "s" : ""}`
                  : "Search across your entire library"}
              </p>
            </div>
            <div className="header-actions">
              <select
                className="sort-select"
                value={filters.sort}
                onChange={setField("sort")}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Search bar with history dropdown ── */}
          <div style={{ position: "relative", maxWidth: "100%", marginBottom: 16 }} ref={searchWrapRef}>
            <div className="search-bar" style={{ maxWidth: "100%", marginBottom: 0, display: "flex", alignItems: "center" }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by title, author, or keywords…"
                value={filters.q}
                onChange={setField("q")}
                onFocus={() => setShowHistory(true)}
                autoComplete="off"
              />

              {/* Mic button */}
              <button
                onClick={listening ? stopVoice : startVoice}
                title={listening ? "Stop listening" : "Search by voice"}
                style={{
                  background: listening ? "rgba(0,229,255,0.15)" : "rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.3)",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: listening ? "#00e5ff" : "rgba(0,229,255,0.7)",
                  fontSize: 18,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginRight: 6,
                  transition: "all .2s",
                  animation: "none",
                }}
                onMouseEnter={e => { if (!listening) e.currentTarget.style.background = "rgba(0,229,255,0.18)"; }}
                onMouseLeave={e => { if (!listening) e.currentTarget.style.background = "rgba(0,229,255,0.08)"; }}
              >
                {listening ? "🔴" : "🎙️"}
              </button>

              {filters.q && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, q: "" }))}
                  title="Clear search"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(150,160,190,0.7)",
                    fontSize: 15,
                    lineHeight: 1,
                    padding: "0 10px 0 4px",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    transition: "color .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ff4d6d"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(150,160,190,0.7)"}
                >
                  ✕
                </button>
              )}
            </div>

            {/* History Dropdown */}
            {showHistory && (
              <SearchHistoryDropdown
                anchorRef={searchWrapRef}
                history={searchHistory}
                onSelect={handleSelectHistory}
                onRemove={handleRemoveHistoryItem}
                onClearAll={handleClearAllHistory}
                onEdit={handleEditHistoryItem}
              />
            )}
          </div>

          {/* Author + Year row */}
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            <div className="search-bar" style={{ flex:"1 1 200px", marginBottom:0 }}>
              <span className="search-icon">👤</span>
              <input
                type="text"
                placeholder="Author contains…"
                value={filters.author}
                onChange={setField("author")}
              />
            </div>
            <div className="search-bar" style={{ flex:"0 0 130px", marginBottom:0, border: yearError ? "1px solid rgba(255,77,109,0.7)" : undefined }}>
              <span className="search-icon">📅</span>
              <input
                type="number"
                placeholder="Year from"
                value={filters.yearMin}
                onChange={setField("yearMin")}
                min={0} max={9999}
              />
            </div>
            <div className="search-bar" style={{ flex:"0 0 130px", marginBottom:0, border: yearError ? "1px solid rgba(255,77,109,0.7)" : undefined }}>
              <span className="search-icon">📅</span>
              <input
                type="number"
                placeholder="Year to"
                value={filters.yearMax}
                onChange={setField("yearMax")}
                min={0} max={9999}
              />
            </div>
          </div>

          {/* Year validation error */}
          {yearError && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: -12,
              marginBottom: 16,
              padding: "9px 14px",
              borderRadius: 8,
              background: "rgba(255,77,109,0.08)",
              border: "1px solid rgba(255,77,109,0.3)",
            }}>
              <span style={{ fontSize: 15 }}>⚠️</span>
              <span style={{ color: "#ff4d6d", fontSize: 13, fontWeight: 600 }}>
                {yearError}
              </span>
            </div>
          )}

          {/* Active genre filter chips */}
          {filters.genres.length > 0 && (
            <div className="filter-bar" style={{ marginBottom:20 }}>
              <span style={{ fontSize:12, color:"var(--text-dim)", alignSelf:"center" }}>Active:</span>
              {filters.genres.map(g => (
                <span
                  key={g}
                  className="chip active"
                  onClick={() => toggleGenre(g)}
                  style={{ cursor:"none" }}
                >
                  {g} ✕
                </span>
              ))}
            </div>
          )}

          {/* ── Skeleton loading cards ── */}
          {loading && (
            <div className="book-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="empty-state">
              <span className="empty-icon">⚠️</span>
              <div className="empty-title">Connection Error</div>
              <div className="empty-desc">{error}</div>
            </div>
          )}

          {/* Empty results */}
          {!loading && !error && searched && books.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🔎</span>
              <div className="empty-title">No books found</div>
              <div className="empty-desc">Try adjusting your filters or clearing them.</div>
            </div>
          )}

          {/* Book Grid */}
          {!loading && !error && books.length > 0 && (
            <div className="book-grid">
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}

        </main>
      </div>
    </>
  );
}