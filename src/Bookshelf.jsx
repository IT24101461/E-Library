// ============================================================
// Bookshelf.jsx — Feature 4: Personal Bookshelf / Favourites
// e-Library Project | IT2150 | DS 2.2 G17
// React Version
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import './Bookshelf.css';

// ============================================================
// CUSTOM CURSOR COMPONENT
// ============================================================
function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef  = useRef(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const rafId   = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }

      // Trail particle
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top  = `${e.clientY}px`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 700);
    };

    const onEnter = () => {
      ringRef.current?.classList.add('hovering');
      dotRef.current?.classList.add('hovering');
    };
    const onLeave = () => {
      ringRef.current?.classList.remove('hovering');
      dotRef.current?.classList.remove('hovering');
    };
    const onDown = () => ringRef.current?.classList.add('clicking');
    const onUp   = () => ringRef.current?.classList.remove('clicking');

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    document.querySelectorAll('button, a, .chip, .sidebar-item, .book-card, .sort-select, .card-action-btn')
      .forEach(el => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });

    // Lerp ring to cursor
    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top  = `${ring.current.y}px`;
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
      <div className="cursor-dot"  ref={dotRef}  />
    </>
  );
}

// ============================================================
// TOAST COMPONENT
// ============================================================
function Toast({ toast }) {
  return (
    <div className={`toast ${toast.show ? 'show' : ''}`}>
      <span className="toast-icon">{toast.icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

// ============================================================
// MODAL COMPONENT
// ============================================================
function Modal({ id, isOpen, onClose, children }) {
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

// ============================================================
// BOOK CARD COMPONENT
// ============================================================
function BookCard({ book, listKey, index, onRemove, onMove, onOpen }) {
  const gradient = {
    'Sci-Fi':  'linear-gradient(160deg,#0d1a2e,#1a3a5c)',
    'Fantasy': 'linear-gradient(160deg,#1a0d2e,#3a1a5c)',
    'Mystery': 'linear-gradient(160deg,#1a1a0d,#3a3a1a)',
    'History': 'linear-gradient(160deg,#2e1a0d,#5c3a1a)',
    'Classic': 'linear-gradient(160deg,#0d2e1a,#1a5c3a)',
    'Romance': 'linear-gradient(160deg,#2e0d1a,#5c1a3a)',
  }[book.genre] || 'linear-gradient(160deg,#1a1a2e,#2a2a4a)';

  const statusBadge =
    book.status === 'currently reading' ? <span className="status-badge status-reading">Reading</span>   :
    book.status === 'completed'         ? <span className="status-badge status-completed">Done</span>     :
    book.status === 'new'               ? <span className="status-badge status-new">New</span>            : null;

  return (
    <div
      className="book-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onOpen(book.title)}
    >
      <div className="book-cover">
        <div className="cover-placeholder" style={{ background: gradient }}>
          <span>{book.emoji}</span>
          <div className="cover-title">{book.title}</div>
        </div>
        <div className="cover-gradient" />
        {statusBadge}
        {book.progress > 0 && (
          <div className="progress-bar-cover">
            <div className="progress-fill" style={{ width: `${book.progress}%` }} />
          </div>
        )}
        <div className="card-actions">
          <button
            className="card-action-btn btn-move"
            title="Move to list"
            onClick={(e) => { e.stopPropagation(); onMove(book.id, listKey); }}
          >↔</button>
          <button
            className="card-action-btn"
            title="Remove"
            onClick={(e) => { e.stopPropagation(); onRemove(book.id, listKey); }}
          >✕</button>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        <div className="book-meta">
          <span className="book-genre-tag">{book.genre}</span>
          <span className="book-rating-mini">★ <span>{book.rating}</span></span>
        </div>
        <div className="progress-text">
          {book.progress ? `${book.progress}% complete` : 'Not started'}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BOOK LIST SECTION COMPONENT
// ============================================================
function BookListSection({ id, icon, title, badgeClass, books, listKey, view, onRemove, onMove, onOpen, onClear, onNewList, onDelete }) {
  const emptyMessages = {
    favourites: ['⭐', 'No favourites yet',        'Click "Add to Favourites" on any book page'],
    reading:    ['📖', 'Not reading anything yet', 'Start reading a book to track your progress'],
    wishlist:   ['🎯', 'Your wishlist is empty',   'Save books you want to read later'],
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
            <button
              className={`list-action-btn ${listKey === 'wishlist' ? 'danger' : ''}`}
              onClick={() => onClear(listKey)}
            >Clear All</button>
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
            <BookCard
              key={book.id}
              book={book}
              listKey={listKey}
              index={i}
              onRemove={onRemove}
              onMove={onMove}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN BOOKSHELF COMPONENT
// ============================================================
export default function Bookshelf() {

  const API = 'http://localhost:8080/api/bookshelf';

  // ── State ──────────────────────────────────────────────────
  const [bookshelf, setBookshelf] = useState({ favourites: [], reading: [], wishlist: [] });
  const [customLists, setCustomLists]       = useState([]);
  const [loading, setLoading]               = useState(true);

  const [view,        setView]        = useState('grid');
  const [genreFilter, setGenreFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode,    setSortMode]    = useState('date');

  const [favAdded, setFavAdded] = useState(false);

  // Modals
  const [newListModal,  setNewListModal]  = useState(false);
  const [confirmModal,  setConfirmModal]  = useState(false);
  const [moveModal,     setMoveModal]     = useState(false);
  const [newListName,   setNewListName]   = useState('');
  const [pendingClear,  setPendingClear]  = useState(null);
  const [pendingMove,   setPendingMove]   = useState({ id: null, from: null });

  const [toast,    setToast]    = useState({ show: false, icon: '', message: '' });
  const toastTimer = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────
  const showToast = useCallback((icon, message) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, icon, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── LOAD all books from backend on mount ─────────────────────
  useEffect(() => {
    fetch(`${API}/all`)
      .then(r => r.json())
      .then(books => {
        // Standard lists
        const favourites = books.filter(b => b.listName === 'favourites');
        const reading    = books.filter(b => b.listName === 'reading');
        const wishlist   = books.filter(b => b.listName === 'wishlist');
        setBookshelf({ favourites, reading, wishlist });

        // Custom lists — any listName that isn't a standard one
        const standardLists = ['favourites', 'reading', 'wishlist'];
        const customBooks   = books.filter(b => !standardLists.includes(b.listName));
        const groupedCustom = customBooks.reduce((acc, book) => {
          const existing = acc.find(l => l.name === book.listName);
          if (existing) { existing.books.push(book); }
          else { acc.push({ id: `custom_${book.listName}`, name: book.listName, books: [book] }); }
          return acc;
        }, []);
        setCustomLists(groupedCustom);
        setLoading(false);
      })
      .catch(() => { showToast('❌', 'Could not connect to server'); setLoading(false); });
  }, []);

  // ── ADD TO FAVOURITES ────────────────────────────────────────
  const addToFavourites = async (title, author, emoji, genre, rating) => {
    const exists = bookshelf.favourites.find(b => b.title === title);
    if (exists) { showToast('⭐', `"${title}" is already in Favourites!`); return; }

    try {
      const res  = await fetch(`${API}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, emoji: emoji || '📚', genre: genre || 'General', rating: rating || 0, status: 'new', progress: 0, listName: 'favourites' }),
      });
      if (!res.ok) { const msg = await res.text(); showToast('❌', msg); return; }
      const saved = await res.json();
      setBookshelf(prev => ({ ...prev, favourites: [...prev.favourites, saved] }));
      setFavAdded(true);
      showToast('⭐', `"${title}" added to Favourites!`);
      setTimeout(() => document.getElementById('list-fav')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
    } catch { showToast('❌', 'Server error — could not add book'); }
  };

  // ── REMOVE BOOK ──────────────────────────────────────────────
  const removeBook = async (id, listKey) => {
    try {
      await fetch(`${API}/remove/${id}`, { method: 'DELETE' });
      if (listKey.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === listKey ? { ...l, books: l.books.filter(b => b.id !== id) } : l));
      } else {
        setBookshelf(prev => ({ ...prev, [listKey]: prev[listKey].filter(b => b.id !== id) }));
      }
      showToast('🗑️', 'Book removed');
    } catch { showToast('❌', 'Could not remove book'); }
  };

  // ── CLEAR LIST ───────────────────────────────────────────────
  const clearList    = (listKey) => { setPendingClear(listKey); setConfirmModal(true); };

  const deleteCustomList = async (listId) => {
    const list = customLists.find(l => l.id === listId);
    if (!list) return;
    try {
      await fetch(`${API}/clear/${encodeURIComponent(list.name)}`, { method: 'DELETE' });
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
      await fetch(`${API}/clear/${encodeURIComponent(listName)}`, { method: 'DELETE' });
      if (pendingClear.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === pendingClear ? { ...l, books: [] } : l));
      } else {
        setBookshelf(prev => ({ ...prev, [pendingClear]: [] }));
      }
      setConfirmModal(false);
      showToast('🗑️', 'List cleared');
      setPendingClear(null);
    } catch { showToast('❌', 'Could not clear list'); }
  };

  // ── MOVE BOOK ────────────────────────────────────────────────
  const openMoveModal = (id, from) => { setPendingMove({ id, from }); setMoveModal(true); };

  const moveToList = async (targetList) => {
    const { id, from } = pendingMove;
    if (!id || targetList === from) { setMoveModal(false); return; }

    // resolve real listName for custom lists
    const resolvedTarget = targetList.startsWith('custom_')
      ? customLists.find(l => l.id === targetList)?.name
      : targetList;

    try {
      const res = await fetch(`${API}/move/${id}?targetList=${encodeURIComponent(resolvedTarget)}`, { method: 'PUT' });
      if (!res.ok) { showToast('⚠️', await res.text()); setMoveModal(false); return; }
      const moved = await res.json();

      // Remove from source in UI
      if (from.startsWith('custom_')) {
        setCustomLists(prev => prev.map(l => l.id === from ? { ...l, books: l.books.filter(b => b.id !== id) } : l));
      } else {
        setBookshelf(prev => ({ ...prev, [from]: prev[from].filter(b => b.id !== id) }));
      }
      // Add to target in UI
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

  // ── CREATE NEW CUSTOM LIST ───────────────────────────────────
  const createNewList = async () => {
    if (!newListName.trim()) { showToast('⚠️', 'Please enter a list name'); return; }
    const duplicate = customLists.find(l => l.name.toLowerCase() === newListName.trim().toLowerCase());
    if (duplicate) { showToast('⚠️', `"${newListName}" already exists`); return; }

    // Lists are identified purely by listName in the books table — no separate API call needed.
    // The list will appear in DB as soon as the first book is added to it.
    const newList = { id: `custom_${newListName.trim()}`, name: newListName.trim(), books: [] };
    setCustomLists(prev => [...prev, newList]);
    showToast('📌', `List "${newListName.trim()}" created!`);
    setNewListName('');
    setNewListModal(false);
    setTimeout(() => document.getElementById(`list-${newList.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  };

  // ── OPEN BOOK ────────────────────────────────────────────────
  const openBook = (title) => {
    showToast('📖', `Opening "${title}"...`);
    // In integration: navigate(`/read?title=${encodeURIComponent(title)}`);
  };

  // ── FILTER & SORT ───────────────────────────────────────────
  const applyFilters = (books) => {
    let result = [...books];
    if (genreFilter !== 'all') result = result.filter(b => b.genre === genreFilter);
    if (searchQuery)           result = result.filter(b =>
      b.title.toLowerCase().includes(searchQuery) ||
      b.author.toLowerCase().includes(searchQuery)
    );
    if (sortMode === 'title')  result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === 'author') result.sort((a, b) => a.author.localeCompare(b.author));
    if (sortMode === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  };

  // ── COUNTS ──────────────────────────────────────────────────
  const allBooks   = [...Object.values(bookshelf).flat(), ...customLists.flatMap(l => l.books)];
  const totalBooks = allBooks.length;
  const readingCnt = bookshelf.reading.length;
  const doneCnt    = allBooks.filter(b => b.status === 'completed').length;

  // ── RENDER ──────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'#aaa', fontSize:'1.2rem' }}>
      📚 Loading your bookshelf...
    </div>
  );

  return (
    <>
      <CustomCursor />
      <div className="noise-overlay" />

      {/* ── TOPBAR ── */}
      <nav className="topbar">
        <div className="topbar-logo">e<span>Library</span></div>
        <div className="topbar-nav">
          <a href="#">Home</a>
          <a href="#">Browse</a>
          <a href="#" className="active">My Bookshelf</a>
          <a href="#">History</a>
        </div>
        <div className="topbar-user">U</div>
      </nav>

      {/* ── BOOK DETAIL BANNER (simulate other member's page) ── */}
      <div className="demo-banner">
        <div className="demo-book-cover" />
        <div className="demo-book-info">
          <div className="book-category">Science Fiction</div>
          <h2>Dune: The Desert Planet</h2>
          <div className="author">Frank Herbert · 1965</div>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>4.8</span>
            <span className="rating-count">(12,403 reviews)</span>
          </div>
          <div className="demo-actions">
            {/* ⭐ THE ADD TO FAVOURITES BUTTON ⭐ */}
            <button
              className={`btn-add-fav ${favAdded ? 'added' : ''}`}
              onClick={() => addToFavourites('Dune: The Desert Planet', 'Frank Herbert', '🌏', 'Sci-Fi', 4.8)}
              disabled={favAdded}
            >
              <span>{favAdded ? '✅' : '⭐'}</span>
              <span>{favAdded ? 'ADDED TO FAVOURITES' : 'ADD TO FAVOURITES'}</span>
            </button>
            <button className="btn-read">📖 Read Now</button>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="main-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Library</div>
            {[
              { label: 'All Books',    icon: '📚', count: totalBooks },
              { label: 'Reading',      icon: '📖', count: readingCnt },
              { label: 'Completed',    icon: '✅', count: doneCnt },
              { label: 'New Arrivals', icon: '✨', count: allBooks.filter(b => b.status === 'new').length },
            ].map((item, i) => (
              <div key={i} className={`sidebar-item ${i === 0 ? 'active' : ''}`}>
                <span className="icon">{item.icon}</span>
                {item.label}
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">My Lists</div>
            {[
              { label: 'Favourites',   icon: '⭐', count: bookshelf.favourites.length, target: 'list-fav' },
              { label: 'Want to Read', icon: '🎯', count: bookshelf.wishlist.length,   target: 'list-wishlist' },
              { label: 'Custom Lists', icon: '📌', count: customLists.reduce((s,l) => s + l.books.length, 0), target: 'list-custom_1' },
            ].map((item, i) => (
              <div key={i} className="sidebar-item"
                onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="icon">{item.icon}</span>
                {item.label}
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Genres</div>
            {[['🚀','Sci-Fi'],['🐉','Fantasy'],['🔍','Mystery'],['📜','History']].map(([icon, genre]) => (
              <div key={genre} className="sidebar-item"
                onClick={() => setGenreFilter(genre)}>
                <span className="icon">{icon}</span>{genre}
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="content">

          {/* STATS */}
          <div className="stats-bar">
            {[
              { value: totalBooks, label: 'Total Books' },
              { value: readingCnt, label: 'Reading' },
              { value: doneCnt,    label: 'Completed' },
              { value: 3 + customLists.length, label: 'My Lists' },
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
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search your bookshelf..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value.toLowerCase())}
            />
          </div>

          {/* GENRE CHIPS */}
          <div className="filter-bar">
            {[['all','All Genres'],['Sci-Fi','🚀 Sci-Fi'],['Fantasy','🐉 Fantasy'],['Mystery','🔍 Mystery'],['History','📜 History'],['Romance','💕 Romance']].map(([val, label]) => (
              <div
                key={val}
                className={`chip ${genreFilter === val ? 'active' : ''}`}
                onClick={() => setGenreFilter(val)}
              >{label}</div>
            ))}
          </div>

          {/* BOOK LISTS */}
          {[
            { id: 'list-fav',      icon: '⭐', title: 'Favourites',        badgeClass: 'badge-fav',     key: 'favourites' },
            { id: 'list-reading',  icon: '📖', title: 'Currently Reading', badgeClass: 'badge-reading', key: 'reading'    },
            { id: 'list-wishlist', icon: '🎯', title: 'Want to Read',      badgeClass: 'badge-wishlist',key: 'wishlist'   },
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

          {/* DYNAMIC CUSTOM LISTS */}
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
          {customLists.map((cl) => (
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

        </main>
      </div>

      {/* ── MODALS ── */}

      {/* New List Modal */}
      <Modal isOpen={newListModal} onClose={() => setNewListModal(false)}>
        <h3>Create New List</h3>
        <p>Give your reading list a name to organise your books.</p>
        <input
          type="text"
          placeholder="e.g. Summer Reads, Must Read..."
          maxLength={40}
          value={newListName}
          onChange={e => setNewListName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createNewList()}
          autoFocus
        />
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={() => setNewListModal(false)}>Cancel</button>
          <button className="btn-modal-create" onClick={createNewList}>Create List</button>
        </div>
      </Modal>

      {/* Confirm Clear Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)}>
        <h3>Clear List?</h3>
        <p className="confirm-text">
          This will remove all books from your "{pendingClear}" list. This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={() => setConfirmModal(false)}>Cancel</button>
          <button className="btn-danger-confirm" onClick={confirmClear}>Yes, Clear All</button>
        </div>
      </Modal>

      {/* Move Modal */}
      <Modal isOpen={moveModal} onClose={() => setMoveModal(false)}>
        <h3>Move to List</h3>
        <p>Choose which list to move this book to.</p>
        <div>
          {[['favourites','⭐ Favourites'],['reading','📖 Currently Reading'],['wishlist','🎯 Want to Read']].map(([key, label]) => (
            <div key={key} className="move-option" onClick={() => moveToList(key)}>{label}</div>
          ))}
          {customLists.length > 0 && (
            <>
              <div className="move-option-divider">── My Custom Lists ──</div>
              {customLists.map(cl => (
                <div key={cl.id} className="move-option" onClick={() => moveToList(cl.id)}>📌 {cl.name}</div>
              ))}
            </>
          )}
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn-modal-cancel" onClick={() => setMoveModal(false)}>Cancel</button>
        </div>
      </Modal>

      {/* ── TOAST ── */}
      <Toast toast={toast} />
    </>
  );
}