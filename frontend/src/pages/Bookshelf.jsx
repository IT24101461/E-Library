// ============================================================
// Bookshelf.jsx — Feature 4: Personal Bookshelf / Favourites
// e-Library Project
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import './Bookshelf.css';

function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 700);
    };
    const onEnter = () => { ringRef.current?.classList.add('hovering'); dotRef.current?.classList.add('hovering'); };
    const onLeave = () => { ringRef.current?.classList.remove('hovering'); dotRef.current?.classList.remove('hovering'); };
    const onDown = () => ringRef.current?.classList.add('clicking');
    const onUp = () => ringRef.current?.classList.remove('clicking');

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.querySelectorAll('button, a, .chip, .sidebar-item, .book-card, .sort-select, .card-action-btn')
      .forEach(el => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });

    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" ref={dotRef} />
    </>
  );
}

function Toast({ toast }) {
  return (
    <div className={`toast ${toast.show ? 'show' : ''}`}>
      <span className="toast-icon">{toast.icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">{children}</div>
    </div>
  );
}

function BookCard({ book, listKey, index, onRemove, onMove, onOpen }) {
  const [imgError, setImgError] = useState(false);

  const gradient = {
    'Sci-Fi': 'linear-gradient(160deg,#0d1a2e,#1a3a5c)',
    'Fantasy': 'linear-gradient(160deg,#1a0d2e,#3a1a5c)',
    'Mystery': 'linear-gradient(160deg,#1a1a0d,#3a3a1a)',
    'History': 'linear-gradient(160deg,#2e1a0d,#5c3a1a)',
    'Classic': 'linear-gradient(160deg,#0d2e1a,#1a5c3a)',
    'Romance': 'linear-gradient(160deg,#2e0d1a,#5c1a3a)',
    'Horror': 'linear-gradient(160deg,#1a0000,#3a0d0d)',
    'Thriller': 'linear-gradient(160deg,#0d0d1a,#1a1a3a)',
    'Non-Fiction': 'linear-gradient(160deg,#0d1a1a,#1a3a3a)',
    'Biography': 'linear-gradient(160deg,#1a1a0d,#3a3a1a)',
    'Self-Help': 'linear-gradient(160deg,#0d2e0d,#1a5c1a)',
    'Children': 'linear-gradient(160deg,#2e200d,#5c401a)',
    'Fiction': 'linear-gradient(160deg,#1a0d2e,#2a1a4a)',
  }[book.genre] || 'linear-gradient(160deg,#1a1a2e,#2a2a4a)';

  const statusBadge =
    book.status === 'reading' ? <span className="status-badge status-reading">Reading</span> :
      book.status === 'completed' ? <span className="status-badge status-completed">Done</span> :
        book.status === 'new' ? <span className="status-badge status-new">New</span> : null;

  const hasCover = book.coverImage && !imgError;

  return (
    <div className="book-card" style={{ animationDelay: `${index * 0.05}s` }} onClick={() => onOpen(book.title)}>
      <div className="book-cover">
        {hasCover ? (
          <img src={book.coverImage} alt={book.title} className="cover-img" onError={() => setImgError(true)} />
        ) : (
          <div className="cover-placeholder" style={{ background: gradient }}>
            <span>{book.emoji}</span>
            <div className="cover-title">{book.title}</div>
          </div>
        )}
        <div className="cover-gradient" />
        {statusBadge}
        {book.progress > 0 && (
          <div className="progress-bar-cover">
            <div className="progress-fill" style={{ width: `${book.progress}%` }} />
          </div>
        )}
        <div className="card-actions">
          <button className="card-action-btn btn-move" title="Move to list"
            onClick={(e) => { e.stopPropagation(); onMove(book.id, listKey); }}>↔</button>
          <button className="card-action-btn" title="Remove"
            onClick={(e) => { e.stopPropagation(); onRemove(book.id, listKey); }}>✕</button>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        <div className="book-meta">
          <span className="book-genre-tag">{book.genre}</span>
          {book.matchScore ? (
            <span className="book-rating-mini" style={{ color: '#00e5ff', background: 'rgba(0, 229, 255, 0.1)', fontWeight: 'bold' }}>
              🎯 {book.matchScore}% Match
            </span>
          ) : (
            <span className="book-rating-mini">★ <span>{book.rating}</span></span>
          )}
        </div>
        <div className="progress-text">
          {book.progress ? `${book.progress}% complete` : 'Not started'}
        </div>
      </div>
    </div>
  );
}

function BookListSection({ id, icon, title, badgeClass, books, listKey, view, onRemove, onMove, onOpen, onClear, onNewList, onDelete }) {
  const emptyMessages = {
    favourites: ['⭐', 'No favourites yet', 'Click "Add to Favourites" on any book page'],
    reading: ['📖', 'Not reading anything yet', 'Start reading a book to track your progress'],
    wishlist: ['🎯', 'Your wishlist is empty', 'Save books you want to read later'],
  };
  const isCustom = listKey.startsWith('custom_');
  const [emptyIcon, emptyTitle, emptyDesc] = emptyMessages[listKey] || ['📌', 'No books here yet', 'Move books here from other sections'];

  return (
    <div className="list-section" id={id}>
      <div className="list-header">
        <div className="list-name">
          <span className="list-icon">{icon}</span>
          {title}
          <span className={`list-badge ${badgeClass}`}>
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </div>
        <div className="list-actions">
          {isCustom ? (
            <>
              <button className="list-action-btn" onClick={() => onClear(listKey)}>Clear All</button>
              <button className="list-action-btn danger" onClick={onDelete} title="Delete this list">🗑 Delete List</button>
            </>
          ) : (
            <button className={`list-action-btn ${listKey === 'wishlist' ? 'danger' : ''}`}
              onClick={() => onClear(listKey)}>Clear All</button>
          )}
        </div>
      </div>
      <div className={`book-grid ${view === 'list' ? 'book-list-view' : ''}`}>
        {books.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{emptyIcon}</span>
            <div className="empty-title">{emptyTitle}</div>
            <div className="empty-desc">{emptyDesc}</div>
          </div>
        ) : (
          books.map((book, i) => (
            <BookCard key={book.id} book={book} listKey={listKey} index={i}
              onRemove={onRemove} onMove={onMove} onOpen={onOpen} />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN BOOKSHELF COMPONENT
// ============================================================
export default function Bookshelf({ onNavigate }) {

  const API = 'http://localhost:8080/api/bookshelf';

  // Extract auth user logic to get userId parameter
  const rawAuth = localStorage.getItem('authUser');
  const authUser = rawAuth ? JSON.parse(rawAuth) : { id: 1, role: 'USER' };
  const userId = authUser.id;

  const [bookshelf, setBookshelf] = useState({ favourites: [], reading: [], wishlist: [] });
  const [customLists, setCustomLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // AI Search states
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [addingAIBook, setAddingAIBook] = useState(null);

  const [view, setView] = useState('grid');
  const [genreFilter, setGenreFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('date');
  const [activeFilter, setActiveFilter] = useState('all'); // all | reading | completed | new

  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'dark');
  useEffect(() => {
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const [favAdded, setFavAdded] = useState(new Set());
  const [demoBookIdx, setDemoBookIdx] = useState(0);

  const [newListModal, setNewListModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [pendingClear, setPendingClear] = useState(null);
  const [pendingMove, setPendingMove] = useState({ id: null, from: null });

  const [toast, setToast] = useState({ show: false, icon: '', message: '' });
  const toastTimer = useRef(null);

  const showToast = useCallback((icon, message) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, icon, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  const performAISearch = async () => {
    if (!searchQuery.trim()) {
      showToast('⚠️', 'Please type a search query first');
      return;
    }
    setAiSearching(true);
    setAiResults([]);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/recommend/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: searchQuery, description: '', query: searchQuery })
      });
      const data = await response.json();
      if (data.status === 'success' && data.recommendations) {
        const mapped = data.recommendations.map(r => ({
          id: r.id,
          title: r.title,
          author: r.author,
          coverImage: r.cover_url,
          rating: r.match_score > 90 ? 5 : r.match_score > 80 ? 4 : 3,
          matchScore: r.match_score,
          genre: 'AI Match',
          status: 'new',
          emoji: '🤖',
          progress: 0
        }));
        setAiResults(mapped);
        if (mapped.length > 0) {
          showToast('✨', `Found ${mapped.length} AI recommendations!`);
        } else {
          showToast('🤖', 'No strong matches found.');
        }
      } else {
        throw new Error(data.message || 'AI search failed');
      }
    } catch (err) {
      console.error(err);
      showToast('❌', 'Could not connect to AI Engine (Is Python backend running?)');
    } finally {
      setAiSearching(false);
    }
  };

  const addAIToList = async (targetListName) => {
    const book = aiResults.find(b => b.id === addingAIBook);
    if (!book) return;
    try {
      const response = await fetch('http://localhost:8080/api/bookshelf/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          title: book.title,
          author: book.author || 'Unknown',
          emoji: '🤖',
          genre: 'AI Match',
          rating: book.rating || 0,
          status: 'new',
          progress: 0,
          listName: targetListName,
          coverImage: book.coverImage || ''
        })
      });
      if (response.ok) {
        showToast('✅', `Added "${book.title}" to ${targetListName}`);
        setMoveModal(false);
        setAddingAIBook(null);
        const savedBook = await response.json();
        
        if (targetListName === 'favourites' || targetListName === 'wishlist') {
            setBookshelf(prev => ({...prev, [targetListName]: [...prev[targetListName], savedBook]}));
        } else {
            setCustomLists(prev => prev.map(l => l.name === targetListName ? {...l, books: [...l.books, savedBook]} : l));
        }
        
      } else {
        showToast('❌', 'Failed to save book');
      }
    } catch {
       showToast('❌', 'Network error');
    }
  };

  // ── LOAD books ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/all?userId=${userId}`)
      .then(r => r.json())
      .then(rawBooks => {
        // Ensure rawBooks is an array
        if (!Array.isArray(rawBooks)) {
          console.error('Invalid response format:', rawBooks);
          showToast('❌', 'Invalid server response');
          setLoading(false);
          return;
        }
        
        const LIST_MAP = {
          currentlyReading: 'reading',
          read: 'favourites',
          wantToRead: 'wishlist',
          reading: 'reading',
          favourites: 'favourites',
          wishlist: 'wishlist',
        };
        const books = rawBooks.map(b => ({
          ...b,
          coverImage: b.coverImage || b.cover_image || null,
          status: b.status === 'reading' ? 'reading'
            : b.status === 'completed' ? 'completed'
              : b.status === 'wantToRead' ? 'new'
                : b.status,
          listName: LIST_MAP[b.listName] || LIST_MAP[b.list_name] || b.listName || b.list_name,
        }));

        const favourites = books.filter(b => b.listName === 'favourites');
        const reading = books.filter(b => b.listName === 'reading');
        const wishlist = books.filter(b => b.listName === 'wishlist');
        setBookshelf({ favourites, reading, wishlist });

        const standardLists = ['favourites', 'reading', 'wishlist'];
        const customBooks = books.filter(b => !standardLists.includes(b.listName));
        const groupedCustom = customBooks.reduce((acc, book) => {
          const existing = acc.find(l => l.name === book.listName);
          if (existing) { existing.books.push(book); }
          else { acc.push({ id: `custom_${book.listName}`, name: book.listName, books: [book] }); }
          return acc;
        }, []);
        setCustomLists(groupedCustom);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        showToast('❌', 'Could not connect to server');
        setLoading(false);
      });
  }, [userId, showToast]);

  // ── ADD TO FAVOURITES ────────────────────────────────────────
  const addToFavourites = async (title, author, emoji, genre, rating) => {
    const exists = bookshelf.favourites.find(b => b.title === title);
    if (exists) { showToast('⭐', `"${title}" is already in Favourites!`); return; }
    try {
      const res = await fetch(`${API}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          emoji: emoji || '📚',
          genre: genre || 'General',
          rating: rating || 0,
          status: 'new',
          progress: 0,
          listName: 'favourites',
          userId: userId
        }),
      });
      if (!res.ok) { showToast('❌', await res.text()); return; }
      const saved = await res.json();
      setBookshelf(prev => ({ ...prev, favourites: [...prev.favourites, saved] }));
      setFavAdded(prev => new Set([...prev, title]));
      showToast('⭐', `"${title}" added to Favourites!`);
      setTimeout(() => document.getElementById('list-fav')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
    } catch { showToast('❌', 'Server error — could not add book'); }
  };

  // ── REMOVE ───────────────────────────────────────────────────
  const removeBook = async (id, listKey) => {
    try {
      await fetch(`${API}/remove/${id}`, { method: 'DELETE' });
      if (listKey.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === listKey ? { ...l, books: l.books.filter(b => b.id !== id) } : l));
      } else {
        if (listKey === 'favourites') {
          const removed = bookshelf.favourites.find(b => b.id === id);
          if (removed) setFavAdded(prev => { const next = new Set(prev); next.delete(removed.title); return next; });
        }
        setBookshelf(prev => ({ ...prev, [listKey]: prev[listKey].filter(b => b.id !== id) }));
      }
      showToast('🗑️', 'Book removed');
    } catch { showToast('❌', 'Could not remove book'); }
  };

  // ── CLEAR ────────────────────────────────────────────────────
  const clearList = (listKey) => { setPendingClear(listKey); setConfirmModal(true); };

  const deleteCustomList = async (listId) => {
    const list = customLists.find(l => l.id === listId);
    if (!list) return;
    try {
      await fetch(`${API}/clear/${encodeURIComponent(list.name)}?userId=${userId}`, { method: 'DELETE' });
      setCustomLists(prev => prev.filter(l => l.id !== listId));
      showToast('🗑️', `"${list.name}" deleted`);
    } catch { showToast('❌', 'Could not delete list'); }
  };

  const confirmClear = async () => {
    if (!pendingClear) return;
    const listName = pendingClear.startsWith('custom_')
      ? customLists.find(l => l.id === pendingClear)?.name
      : pendingClear;
    try {
      await fetch(`${API}/clear/${encodeURIComponent(listName)}?userId=${userId}`, { method: 'DELETE' });
      if (pendingClear.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === pendingClear ? { ...l, books: [] } : l));
      } else {
        setBookshelf(prev => ({ ...prev, [pendingClear]: [] }));
        if (pendingClear === 'favourites') setFavAdded(new Set());
      }
      setConfirmModal(false);
      showToast('🗑️', 'List cleared');
      setPendingClear(null);
    } catch { showToast('❌', 'Could not clear list'); }
  };

  // ── MOVE ─────────────────────────────────────────────────────
  const openMoveModal = (id, from) => { setPendingMove({ id, from }); setMoveModal(true); };

  const moveToList = async (targetList) => {
    const { id, from } = pendingMove;
    if (!id || targetList === from) { setMoveModal(false); return; }
    const resolvedTarget = targetList.startsWith('custom_')
      ? customLists.find(l => l.id === targetList)?.name
      : targetList;
    try {
      const res = await fetch(`${API}/move/${id}?targetList=${encodeURIComponent(resolvedTarget)}`, { method: 'PUT' });
      if (!res.ok) { showToast('⚠️', await res.text()); setMoveModal(false); return; }
      const moved = await res.json();
      if (from.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === from ? { ...l, books: l.books.filter(b => b.id !== id) } : l));
      } else {
        setBookshelf(prev => ({ ...prev, [from]: prev[from].filter(b => b.id !== id) }));
      }
      if (targetList.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === targetList ? { ...l, books: [...l.books, moved] } : l));
      } else {
        setBookshelf(prev => ({ ...prev, [targetList]: [...prev[targetList], moved] }));
      }
      setMoveModal(false);
      showToast('✅', `Moved to ${resolvedTarget}`);
      setPendingMove({ id: null, from: null });
    } catch { showToast('❌', 'Could not move book'); }
  };

  // ── CREATE CUSTOM LIST ────────────────────────────────────────
  const createNewList = async () => {
    if (!newListName.trim()) { showToast('⚠️', 'Please enter a list name'); return; }
    const duplicate = customLists.find(l => l.name.toLowerCase() === newListName.trim().toLowerCase());
    if (duplicate) { showToast('⚠️', `"${newListName}" already exists`); return; }
    const newList = { id: `custom_${newListName.trim()}`, name: newListName.trim(), books: [] };
    setCustomLists(prev => [...prev, newList]);
    showToast('📌', `List "${newListName.trim()}" created!`);
    setNewListName('');
    setNewListModal(false);
    setTimeout(() => document.getElementById(`list-${newList.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  };

  const openBook = (title) => showToast('📖', `Opening "${title}"...`);

  // ── FILTER & SORT ─────────────────────────────────────────────
  const applyFilters = (books) => {
    let result = [...books];
    if (genreFilter !== 'all') result = result.filter(b => b.genre === genreFilter);
    if (searchQuery) result = result.filter(b =>
      b.title.toLowerCase().includes(searchQuery) || b.author.toLowerCase().includes(searchQuery));
    if (activeFilter === 'reading') result = result.filter(b => b.status === 'reading');
    if (activeFilter === 'completed') result = result.filter(b => b.status === 'completed');
    if (activeFilter === 'new') result = result.filter(b => b.status === 'new');
    if (sortMode === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === 'author') result.sort((a, b) => a.author.localeCompare(b.author));
    if (sortMode === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  };

  // ── COUNTS ────────────────────────────────────────────────────
  const allBooks = [...Object.values(bookshelf).flat(), ...customLists.flatMap(l => l.books)];
  const featuredBooks = allBooks;
  const currentDemo = featuredBooks.length > 0 ? featuredBooks[demoBookIdx % featuredBooks.length] : null;
  const totalBooks = allBooks.length;
  const readingCnt = bookshelf.reading.length;
  const doneCnt = allBooks.filter(b => b.status === 'completed').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#aaa', fontSize: '1.2rem' }}>
      📚 Loading your bookshelf...
    </div>
  );

  return (
    <div className="bookshelf-root" data-theme={theme}>
      <CustomCursor />



      {/* ── AI DISCOVERY BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d2137 50%, #0f172a 100%)',
        borderBottom: '1px solid #1e3a5f',
        padding: '24px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(0,229,255,0.04)', top: -100, left: -50, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(99,102,241,0.06)', bottom: -80, right: 100, pointerEvents: 'none'
        }} />

        {/* Robot character */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg,#1e3a5f,#0ea5e9)',
            border: '2px solid rgba(0,229,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
            boxShadow: '0 0 24px rgba(0,229,255,0.2)',
            animation: 'robotFloat 3s ease-in-out infinite',
          }}>🤖</div>
          {/* Wave hand */}
          <div style={{
            position: 'absolute', top: -8, right: -12,
            fontSize: 22,
            animation: 'wave 1.5s ease-in-out infinite',
            transformOrigin: 'bottom center',
          }}>👋</div>
          {/* Speech bubble dot */}
          <div style={{
            position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
            width: 8, height: 8, borderRadius: '50%',
            background: '#00e5ff', boxShadow: '0 0 8px #00e5ff',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </div>

        {/* Text content */}
        <div style={{ flex: 1 }}>
          <div style={{
            color: '#00e5ff', fontSize: 11, fontWeight: 700,
            letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6
          }}>
            AI-Powered Discovery
          </div>
          <div style={{
            color: '#f0f0f0', fontSize: 20, fontWeight: 800,
            fontFamily: "'Syne', sans-serif", marginBottom: 6, lineHeight: 1.3
          }}>
            Didn't find what you're looking for?
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, maxWidth: 480 }}>
            Explore <span style={{ color: '#00e5ff', fontWeight: 600 }}>4,800+ books</span> ranked by our
            AI algorithm. Search by genre, mood, or just chat — our bot will find your next read! 📚
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <button
            onClick={() => { window.location.href = '/chat' }}
            style={{
              background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px 28px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Syne', sans-serif",
              boxShadow: '0 4px 20px rgba(0,229,255,0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'block', marginBottom: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,229,255,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,229,255,0.25)'; }}
          >
            🏆 Explore Book Ranker
          </button>
          <div style={{ color: '#475569', fontSize: 11 }}>Powered by weighted AI scoring</div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="main-layout">



        {/* MAIN CONTENT */}
        <main className="content">

          {/* STATS */}
          <div className="stats-bar">
            {[
              { value: totalBooks, label: 'Total Books' },
              { value: doneCnt, label: 'Completed' },
              { value: 2 + customLists.length, label: 'My Lists' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <span className="stat-value">{s.value}</span>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* PAGE HEADER */}
          <div className="page-header">
            <div>
              <div className="page-title">My Bookshelf</div>
              <div className="page-subtitle">Your personal reading collection</div>
            </div>
            <div className="header-actions">
              <ThemeToggle theme={theme} onToggle={setTheme} />
              <div className="view-toggle">
                <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>⊞</button>
                <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>☰</button>
              </div>
              <select className="sort-select" value={sortMode} onChange={e => setSortMode(e.target.value)}>
                <option value="date">Date Added</option>
                <option value="title">Title A-Z</option>
                <option value="author">Author</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* SEARCH */}
          <div className="search-bar" style={{ display: 'flex', gap: '12px', background: 'transparent', padding: 0 }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--card-bg)', borderRadius: '16px', padding: '0 20px', border: '1px solid var(--border-color)', height: '56px' }}>
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search your bookshelf, or ask AI (e.g. 'book where ghosts are presented')..." 
                style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' }}
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') performAISearch(); }} />
            </div>
            <button onClick={performAISearch} disabled={aiSearching} style={{ height: '56px', padding: '0 24px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(14,165,233,0.3)', opacity: aiSearching ? 0.7 : 1 }}>
              {aiSearching ? <div style={{width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite'}}/> : '✨'}
              {aiSearching ? 'Searching...' : 'Ask AI'}
            </button>
          </div>

          {/* GENRE CHIPS */}
          <div className="filter-bar">
            {[['all', 'All Genres'], ['Sci-Fi', '🚀 Sci-Fi'], ['Fantasy', '🐉 Fantasy'], ['Mystery', '🔍 Mystery'], ['History', '📜 History'], ['Romance', '💕 Romance']].map(([val, label]) => (
              <div key={val} className={`chip ${genreFilter === val ? 'active' : ''}`}
                onClick={() => setGenreFilter(val)}>{label}</div>
            ))}
          </div>

          {/* AI RESULTS */}
          {aiResults.length > 0 && (
            <div style={{ background: 'rgba(0, 229, 255, 0.03)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: '24px', padding: '16px', marginBottom: '32px' }}>
              <BookListSection
                id="list-ai"
                icon="✨"
                title="AI Discovery Results"
                badgeClass="badge-fav"
                books={aiResults}
                listKey="ai"
                view={view}
                onRemove={(id) => setAiResults(prev => prev.filter(b => b.id !== id))}
                onMove={(id) => { setAddingAIBook(id); setMoveModal(true); }}
                onOpen={openBook}
                onClear={() => setAiResults([])}
                onNewList={() => setNewListModal(true)}
              />
            </div>
          )}

          {/* BOOK LISTS */}
          {activeFilter !== 'all' ? (
            <BookListSection
              id="list-filtered"
              icon={activeFilter === 'reading' ? '📖' : activeFilter === 'completed' ? '✅' : '✨'}
              title={activeFilter === 'reading' ? 'Currently Reading' : activeFilter === 'completed' ? 'Completed Books' : 'New Arrivals'}
              badgeClass="badge-reading"
              books={applyFilters(allBooks)}
              listKey="favourites"
              view={view}
              onRemove={removeBook}
              onMove={openMoveModal}
              onOpen={openBook}
              onClear={() => { }}
              onNewList={() => setNewListModal(true)}
            />
          ) : (
            <>
              {[
                { id: 'list-fav', icon: '⭐', title: 'Favourites', badgeClass: 'badge-fav', key: 'favourites' },
                { id: 'list-wishlist', icon: '🎯', title: 'Want to Read', badgeClass: 'badge-wishlist', key: 'wishlist' },
              ].map(section => (
                <BookListSection
                  key={section.key}
                  id={section.id}
                  icon={section.icon}
                  title={section.title}
                  badgeClass={section.badgeClass}
                  books={applyFilters(bookshelf[section.key])}
                  listKey={section.key}
                  view={view}
                  onRemove={removeBook}
                  onMove={openMoveModal}
                  onOpen={openBook}
                  onClear={clearList}
                  onNewList={() => setNewListModal(true)}
                />
              ))}

              {/* CUSTOM LISTS */}
              <div className="custom-lists-header">
                <span className="list-icon">📌</span>
                <span>My Custom Lists</span>
                <button className="btn-new-list" onClick={() => setNewListModal(true)}>＋ New List</button>
              </div>
              {customLists.length === 0 && (
                <div className="empty-state" style={{ marginBottom: '1.5rem' }}>
                  <span className="empty-icon">📌</span>
                  <div className="empty-title">No custom lists yet</div>
                  <div className="empty-desc">Click "＋ New List" to create your first list</div>
                </div>
              )}
              {customLists.map(cl => (
                <BookListSection
                  key={cl.id}
                  id={`list-${cl.id}`}
                  icon="📌"
                  title={cl.name}
                  badgeClass="badge-wishlist"
                  books={applyFilters(cl.books)}
                  listKey={cl.id}
                  view={view}
                  onRemove={removeBook}
                  onMove={openMoveModal}
                  onOpen={openBook}
                  onClear={clearList}
                  onNewList={() => setNewListModal(true)}
                  onDelete={() => deleteCustomList(cl.id)}
                />
              ))}
            </>
          )}

        </main>
      </div>

      {/* ── MODALS ── */}
      <Modal isOpen={newListModal} onClose={() => setNewListModal(false)}>
        <h3>Create New List</h3>
        <p>Give your reading list a name to organise your books.</p>
        <input type="text" placeholder="e.g. Summer Reads, Must Read..." maxLength={40}
          value={newListName} onChange={e => setNewListName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createNewList()} autoFocus />
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={() => setNewListModal(false)}>Cancel</button>
          <button className="btn-modal-create" onClick={createNewList}>Create List</button>
        </div>
      </Modal>

      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)}>
        <h3>Clear List?</h3>
        <p className="confirm-text">This will remove all books from your "{pendingClear}" list. This cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={() => setConfirmModal(false)}>Cancel</button>
          <button className="btn-danger-confirm" onClick={confirmClear}>Yes, Clear All</button>
        </div>
      </Modal>

      <Modal isOpen={moveModal} onClose={() => { setMoveModal(false); setAddingAIBook(null); setPendingMove({ id: null, from: null }); }}>
        <h3>{addingAIBook ? 'Add to List' : 'Move to List'}</h3>
        <p>Choose which list to {addingAIBook ? 'add' : 'move'} this book to.</p>
        <div>
          {[['favourites', '⭐ Favourites'], ['wishlist', '🎯 Want to Read']].map(([key, label]) => (
            <div key={key} className="move-option" onClick={() => addingAIBook ? addAIToList(key) : moveToList(key)}>{label}</div>
          ))}
          {customLists.length > 0 && (
            <>
              <div className="move-option-divider">── My Custom Lists ──</div>
              {customLists.map(cl => (
                <div key={cl.id} className="move-option" onClick={() => addingAIBook ? addAIToList(cl.name) : moveToList(cl.id)}>📌 {cl.name}</div>
              ))}
            </>
          )}
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn-modal-cancel" onClick={() => { setMoveModal(false); setAddingAIBook(null); setPendingMove({ id: null, from: null }); }}>Cancel</button>
        </div>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
