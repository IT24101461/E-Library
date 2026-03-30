import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import HistoryCard from '../components/HistoryCard';
import ProgressBar from '../components/ProgressBar';
import ThemeToggle from '../components/ThemeToggle';
import AIRecommendation from '../components/AIRecommendation';
import RecommendationEngine from '../components/RecommendationEngine';
import { ActivityService } from '../services/ActivityService';
import { ReaderService } from '../services/ReaderService';
import styles from './ActivityDashboard.module.css';

// ── Custom cursor (ported from Bookshelf) ────────────────────────────────────
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
      const trail = document.createElement('div');
      trail.className = styles['cursor-trail'];
      trail.style.left = `${e.clientX}px`;
      trail.style.top  = `${e.clientY}px`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 700);
    };
    const onEnter = () => {
      ringRef.current?.classList.add(styles['hovering']);
      dotRef.current?.classList.add(styles['hovering']);
    };
    const onLeave = () => {
      ringRef.current?.classList.remove(styles['hovering']);
      dotRef.current?.classList.remove(styles['hovering']);
    };
    const onDown = () => ringRef.current?.classList.add(styles['clicking']);
    const onUp   = () => ringRef.current?.classList.remove(styles['clicking']);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    document.querySelectorAll('button, a').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

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
      document.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div className={styles['cursor-ring']} ref={ringRef} />
      <div className={styles['cursor-dot']}  ref={dotRef}  />
    </>
  );
}
// ────────────────────────────────────────────────────────────────────────────

const ActivityDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [totalHighlights, setTotalHighlights] = useState(0);
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    fetchData();
  }, [authUser]);

  // Listen for progress updates coming from the reader and refresh affected history item
  useEffect(() => {
    const onProgressUpdated = async (e) => {
      try {
        const detail = e && e.detail ? e.detail : null;
        if (!detail || !detail.bookId) return;
        const changedBookId = Number(detail.bookId);
        if (Number.isNaN(changedBookId)) return;
        await fetchData();
      } catch (err) {
        console.warn('Failed to handle progressUpdated event', err);
      }
    };

    window.addEventListener('progressUpdated', onProgressUpdated);
    return () => window.removeEventListener('progressUpdated', onProgressUpdated);
  }, [authUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const uid = authUser ? authUser.id : 1;
      const statsRes = await ActivityService.getStats(uid);
      const historyRes = await ActivityService.getHistory(uid);
      setStats(statsRes.data);

      try {
        const bRes = await ReaderService.getBookmarks(uid);
        const hRes = await ReaderService.getHighlights(uid);
        setTotalBookmarks(bRes.data?.length || 0);
        setTotalHighlights(hRes.data?.length || 0);
      } catch (e) {
        console.warn('Could not fetch reader items', e);
      }

      // enrich history items with persisted progress (currentPage / totalPages)
      const rawHistory = historyRes.data || [];
      console.log('[Dashboard] Raw history:', rawHistory);

      const enhanced = await Promise.all(
        rawHistory.map(async (h) => {
          const bookId = h.bookId || h.book?.id || h.id;
          try {
            console.log(`[Dashboard] Fetching progress for bookId=${bookId}`);
            const response = await ActivityService.getProgress(uid, bookId);
            console.log(`[Dashboard] Raw API response for bookId=${bookId}:`, response);

            const prog = response?.data || response;
            console.log(`[Dashboard] Progress data object:`, prog);

            const hp = h || {};
            const bookMeta = hp.book || {};
            const currentPageFromHistory = hp.currentPage ?? hp.page ?? hp.current ?? 0;
            const totalPagesFromHistory = hp.totalPages ?? bookMeta.totalPages ?? bookMeta.pages ?? bookMeta.pageSize ?? hp.pages ?? 0;

            const currentPage = Math.min(prog?.currentPage ?? currentPageFromHistory ?? 0, prog?.totalPages ?? totalPagesFromHistory ?? 0);
            const totalPages = prog?.totalPages ?? totalPagesFromHistory ?? 0;

            console.log(`[Dashboard] Final values for bookId=${bookId}: currentPage=${currentPage}, totalPages=${totalPages}`);
            return { ...h, currentPage, totalPages };
          } catch (e) {
            console.warn(`[Dashboard] Error fetching progress for bookId=${bookId}:`, e);
            return { ...h };
          }
        })
      );

      console.log('[Dashboard] Enhanced history:', enhanced);
      setHistory(enhanced);
      if (enhanced.length > 0) {
        setCurrentBook(enhanced[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load data. Please ensure the backend is running.');
      setStats({ readingVelocity: 20, currentStreak: 3, booksRead: 2 });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await ActivityService.deleteActivity(activityId);
      const updatedHistory = history.filter(item => item.id !== activityId);
      setHistory(updatedHistory);

      if (currentBook && currentBook.id === activityId) {
        if (updatedHistory.length > 0) {
          setCurrentBook(updatedHistory[0]);
        } else {
          setCurrentBook(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      await ActivityService.createActivity({
        bookId,
        userId: authUser ? authUser.id : 1,
        action: 'BORROW',
      });
      fetchData();
    } catch (err) {
      console.error('Failed to borrow book:', err);
    }
  };

  const handleSessionComplete = async (bookId, pagesRead, durationSeconds, velocity) => {
    try {
      const uid = authUser ? authUser.id : 1;
      const existing = history.find((h) => (h.bookId || h.id) === (bookId || 0));
      const prevCurrent = Number(existing?.currentPage || existing?.page || existing?.current || 0);
      const totalPages = Number(existing?.totalPages || existing?.pages || existing?.pageSize || 0) || 0;
      const newCurrent = Math.min(prevCurrent + (pagesRead || 0), totalPages || Number.MAX_SAFE_INTEGER);

      await ActivityService.updateProgress({ userId: uid, bookId, currentPage: newCurrent, totalPages });

      // Log the session explicitly so the backend can permanently calculate Reading Velocity
      await ActivityService.logActivity(uid, 'SESSION', bookId, {
        currentPage: pagesRead || 0,
        timeSpentMinutes: Math.max(1, Math.floor((durationSeconds || 60) / 60))
      });

      const updatedHistory = history.map((h) => {
        const idMatch = (h.bookId || h.id) === (bookId || 0);
        if (!idMatch) return h;
        return { ...h, currentPage: newCurrent, totalPages };
      });
      setHistory(updatedHistory);

      setStats((s) => ({ ...(s || {}), readingVelocity: Math.round(velocity) }));

      console.log(`[Dashboard] Session complete for book ${bookId}: pages=${pagesRead}, duration=${durationSeconds}s, velocity=${velocity.toFixed(2)} p/h`);
    } catch (err) {
      console.error('Failed to process session completion:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles['activitydashboard-loading']} data-theme={theme}>
        <div className={styles['activitydashboard-loading-content']}>
          <div className={styles['activitydashboard-loading-spinner']}></div>
          <p className={styles['activitydashboard-loading-title']}>Loading your library...</p>
          <p className={styles['activitydashboard-loading-subtitle']}>Preparing your reading dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <main className={styles['activitydashboard-main']} data-theme={theme}>
      <CustomCursor />
      <div className={styles['activitydashboard-container']}>

        {/* Error Message */}
        {error && (
          <div className={styles['activitydashboard-alert']}>
            <div className={styles['activitydashboard-alert-content']}>
              <span className={styles['activitydashboard-alert-icon']}>⚠️</span>
              <div>
                <p className={styles['activitydashboard-alert-title']}>Connection Issue</p>
                <p className={styles['activitydashboard-alert-message']}>{error}</p>
                <div className="mt-2">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => fetchData()}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero / Welcome Section */}
        <div className={styles['activitydashboard-hero']}>
          {/* Theme Selector mimicking Reading.jsx */}
          <div className="absolute top-6 right-6 z-20">
            <div className={styles['theme-options']}>
              <button
                className={theme === 'light' ? styles['theme-btn-active'] : ''}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                className={theme === 'dark' ? styles['theme-btn-active'] : ''}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={theme === 'sepia' ? styles['theme-btn-active'] : ''}
                onClick={() => setTheme('sepia')}
              >
                Sepia
              </button>
            </div>
          </div>

          <div className={styles['activitydashboard-hero-inner']}>
            <div className={styles['activitydashboard-hero-content']}>
              <h1 className={styles['activitydashboard-hero-title']}>
                Welcome Back, {authUser?.username || 'Reader'}!
              </h1>
              {authUser && authUser.role === 'ADMIN' && (
                <div className="mb-4 inline-block text-xs bg-white bg-opacity-20 text-indigo-50 px-3 py-1.5 rounded-full border border-white border-opacity-30 backdrop-blur-md">
                  Admin mode enabled
                </div>
              )}
              <p className={styles['activitydashboard-hero-sub']}>
                Ready to dive into your next adventure? Track your progress, achieve your daily goals, and easily resume your favorite books.
              </p>

              <div className={styles['activitydashboard-hero-ctas']}>
                <button className={styles['activitydashboard-hero-cta-primary']} onClick={() => navigate('/books')}>
                  <span className="text-xl">📚</span> Browse Library
                </button>
                <button className={styles['activitydashboard-hero-cta-secondary']} onClick={() => {
                  if (currentBook) {
                    navigate(`/reading/${currentBook.bookId || currentBook.id}?page=${currentBook.currentPage || 1}`)
                  } else {
                    navigate('/books')
                  }
                }}>
                  <span className="text-xl">✨</span> Continue Reading
                </button>
                <button className={styles['activitydashboard-hero-cta-tertiary']} onClick={() => navigate('/history')}>
                  View History
                </button>
                {authUser && authUser.role === 'ADMIN' && (
                  <button
                    className={styles['activitydashboard-hero-cta-tertiary']}
                    style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#854d0e', border: '1px solid rgba(234,179,8,0.4)' }}
                    onClick={() => navigate('/admin')}
                  >
                    🛠️ Admin Dashboard
                  </button>
                )}
              </div>
            </div>

            <div className={styles['activitydashboard-hero-illustration']}>
              {history && history.length > 0 ? (
                <div className={styles['hero-books-showcase']}>
                  {history.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      className={`${styles['hero-book-card']} ${styles[`hero-book-pos-${index}`]}`}
                      style={{ zIndex: 3 - index }}
                      onClick={() => navigate(`/reading/${item.bookId || item.id}?page=${item.currentPage || 1}`)}
                      title={`Continue ${item.title}`}
                    >
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt={item.title} className={styles['hero-book-cover']} />
                      ) : (
                        <div className={styles['hero-book-placeholder']}>
                          <span className="text-5xl">📕</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles['activitydashboard-hero-illus-card']}>
                  <div className="text-center py-4">
                    <span className="text-6xl mb-6 block animate-bounce" style={{animationDuration: '3s'}}>🚀</span>
                    <p className="font-extrabold text-white text-2xl tracking-tight">Your Journey Awaits</p>
                    <p className="text-indigo-200 mt-2">Discover thousands of books</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className={styles['activitydashboard-stats']}>
            <StatsCard icon="⚡" label="Reading Velocity" value={`${stats.readingVelocity}`} color="blue" />
            <StatsCard icon="🔥" label="Current Streak" value={`${stats.currentStreak}`} color="orange" />
            <StatsCard icon="📚" label="Books Read" value={`${stats.booksRead}`} color="purple" />
            <StatsCard icon="⭐" label="Achievements" value="8" color="pink" />
          </div>
        )}

        {/* Full-width AI Recommendations */}
        <div className="mb-8">
          <RecommendationEngine currentBookId={currentBook?.bookId || currentBook?.id || 1508} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Reading History */}
          <div className={styles['activitydashboard-history-main']}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📖</span>
                    Reading History
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{history.length} books in your library</p>
                </div>
                {authUser && authUser.role === 'ADMIN' ? (
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    onClick={() => navigate('/books/add')}
                  >
                    + Add Book
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed" disabled>
                    + Add Book
                  </button>
                )}
              </div>

              {/* History Cards */}
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((book, idx) => (
                    <div key={book.id} className="animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                      <HistoryCard
                        book={book}
                        onDelete={handleDeleteActivity}
                        onSessionComplete={handleSessionComplete}
                      />
                      <AIRecommendation book={book} />
                    </div>
                  ))
                ) : (
                  <div className={styles['activitydashboard-history-empty']}>
                    <span className={styles['activitydashboard-history-empty-icon']}>📚</span>
                    <p className={styles['activitydashboard-history-empty-title']}>No books in your library yet</p>
                    <p className={styles['activitydashboard-history-empty-subtitle']}>Start by browsing books and adding them to your collection</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Currently Reading */}
          <div className={styles['activitydashboard-sidebar']}>
            <div className={styles['activitydashboard-sidebar-sticky']}>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <span>✨</span>
                Continue Reading
              </h2>

              {currentBook ? (
                <div className={styles['activitydashboard-sidebar-card']}>
                  {/* Book Cover */}
                  <div className="h-64 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden group">
                    {currentBook.coverUrl ? (
                      <img
                        src={currentBook.coverUrl}
                        alt={currentBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span style={{display: currentBook.coverUrl ? 'none' : 'flex'}} className="text-6xl">📕</span>
                  </div>

                  {/* Content */}
                  <div className={styles['activitydashboard-sidebar-content']}>
                    <h3 className={styles['activitydashboard-sidebar-book-title']}>{currentBook.title}</h3>
                    <p className={styles['activitydashboard-sidebar-book-author']}>{currentBook.author}</p>

                    {/* Progress Section */}
                    <div className={styles['activitydashboard-sidebar-progress']}>
                      <ProgressBar
                        current={currentBook.currentPage || 0}
                        total={currentBook.totalPages || 300}
                      />
                    </div>

                    {/* Stats */}
                    <div className={styles['activitydashboard-sidebar-meta']}>
                      <div className={styles['activitydashboard-sidebar-meta-card']}>
                        <p className={styles['activitydashboard-sidebar-meta-label']}>Pages Left</p>
                        <p className={styles['activitydashboard-sidebar-meta-value']}>{Math.max(0, currentBook.totalPages - (currentBook.currentPage || 0))}</p>
                      </div>
                      <div className={styles['activitydashboard-sidebar-category-card']}>
                        <p className={styles['activitydashboard-sidebar-category-label']}>Category</p>
                        <p className={styles['activitydashboard-sidebar-category-value']}>{currentBook.category || 'Fiction'}</p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate(`/reading/${currentBook.bookId || currentBook.id}?page=${currentBook.currentPage || 1}`)}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">📖</span>
                        Continue Reading
                      </button>
                      <button className="w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
                  <span className="text-5xl mb-4 block">📚</span>
                  <p className="text-gray-600 font-semibold">No active reading</p>
                  <p className="text-gray-500 text-sm mt-1">Pick a book from the list to continue</p>
                </div>
              )}

              {/* Quick Stats Box */}
              <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Today's Goal
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm">Pages to read</span>
                    <span className="font-bold text-indigo-600">25/30</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '83%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-2">Almost there! 5 more pages to go 💪</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ActivityDashboard;