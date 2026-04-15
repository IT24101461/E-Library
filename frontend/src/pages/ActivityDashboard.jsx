import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Sparkles, AlertCircle, PlayCircle, Award, Book } from 'lucide-react';
import AIRecommendation from '../components/AIRecommendation';
import { ActivityService } from '../services/ActivityService';
import { getApiUrl } from '../config/ApiConfig';
import AdminAccessModal from '../components/AdminAccessModal'; import styles from './ActivityDashboard.module.css';

// Helper to extract cover URL from any possible field name
const extractCoverUrl = (obj) => {
  if (!obj) return '';
  const raw =
    obj.coverUrl ||
    obj.cover_url ||
    obj.coverImage ||
    obj.cover_image ||
    obj.imageUrl ||
    obj.image_url ||
    obj.thumbnail ||
    obj.book?.coverUrl ||
    obj.book?.cover_url ||
    obj.book?.coverImage ||
    obj.book?.cover_image ||
    '';
  if (!raw) return '';
  // Ensure HTTPS to avoid mixed-content blocking
  return raw.startsWith('http://') ? raw.replace('http://', 'https://') : raw;
};

const ActivityDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');
  const [aiRecs, setAiRecs] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testStats, setTestStats] = useState({ readingVelocity: 42, currentStreak: 7, booksRead: 12 });

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('appTheme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  useEffect(() => {
    if (currentBook && (currentBook.bookId || currentBook.id)) {
      fetchRecommendedBooks(currentBook);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBook]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const uid = authUser.id || 1;
      const statsRes = await ActivityService.getStats(uid);
      const historyRes = await ActivityService.getHistory(uid);
      
      setStats(statsRes.data);

      const rawHistory = historyRes.data || [];
      const enhanced = await Promise.all(
        rawHistory.map(async (h) => {
          const bookId = h.bookId || h.book?.id || h.id;
          try {
            const response = await ActivityService.getProgress(uid, bookId);
            const prog = response?.data || response;
            const hp = h || {};
            const bookMeta = hp.book || {};
            const currentPageFromHistory = hp.currentPage ?? hp.page ?? 0;
            const totalPagesFromHistory = hp.totalPages ?? bookMeta.totalPages ?? 0;
            const currentPage = prog?.currentPage ?? currentPageFromHistory ?? 0;
            const totalPages = prog?.totalPages ?? totalPagesFromHistory ?? 0;
            return {
              ...h,
              currentPage,
              totalPages,
              coverUrl: extractCoverUrl(h),
            };
          } catch (e) {
            return {
              ...h,
              coverUrl: extractCoverUrl(h),
            };
          }
        })
      );

      // Deduplicate by bookId — keep only the most recent entry per book
      const seen = new Map();
      for (const item of enhanced) {
        const key = item.bookId || item.id;
        if (!seen.has(key)) {
          seen.set(key, item);
        } else {
          const existing = seen.get(key);
          const existingTime = existing.lastRead ? new Date(existing.lastRead) : new Date(0);
          const itemTime = item.lastRead ? new Date(item.lastRead) : new Date(0);
          if (itemTime > existingTime) {
            seen.set(key, item);
          }
        }
      }
      const deduplicated = Array.from(seen.values());

      setHistory(deduplicated);
      setCurrentBookIndex(0);
      if (deduplicated.length > 0) {
        setCurrentBook(deduplicated[0]);
      } else {
        fetchRecommendedBooks(null);
      }
    } catch (err) {
      setError('Unable to load data. Please ensure the backend is running.');
      setStats({ readingVelocity: 20, currentStreak: 3, booksRead: 2 });
      setHistory([]);
      fetchRecommendedBooks(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdated = (role) => {
    setAuthUser(prev => ({ ...prev, role }));
    const raw = JSON.parse(localStorage.getItem('authUser') || '{}');
    raw.role = role;
    localStorage.setItem('authUser', JSON.stringify(raw));
  };

  const goToPreviousBook = () => {
    if (history.length === 0) return;
    const newIndex = currentBookIndex === 0 ? history.length - 1 : currentBookIndex - 1;
    setCurrentBookIndex(newIndex);
    setCurrentBook(history[newIndex]);
  };

  const goToNextBook = () => {
    if (history.length === 0) return;
    const newIndex = (currentBookIndex + 1) % history.length;
    setCurrentBookIndex(newIndex);
    setCurrentBook(history[newIndex]);
  };

  const fetchRecommendedBooks = async (book = null) => {
    try {
      const bookToUse = book || currentBook;
      if (bookToUse && bookToUse.title) {
        try {
          const mlUrl = getApiUrl().replace(':8080', ':5000');
          const response = await fetch(`${mlUrl}/recommend/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: bookToUse.title || '',
              description: bookToUse.description || '',
              id: bookToUse.bookId || bookToUse.id || 0
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
              const recs = data.recommendations.map(rec => ({
                id: parseInt(rec.id || rec.book_id || 0),
                bookId: parseInt(rec.book_id || rec.id || 0),
                title: rec.title || 'Unknown Title',
                author: rec.author || 'Unknown Author',
                coverUrl: extractCoverUrl(rec),
                category: rec.category || '',
                matchScore: parseFloat(rec.match_score) || 0,
                description: rec.description || ''
              }));
              setAiRecs(recs.slice(0, 5));
              return;
            }
          }
        } catch (mlErr) {}
      }
      
      try {
        const response = await ActivityService.getBooks();
        const books = response.data || [];
        if (books.length > 0) {
          const shuffled = [...books].sort(() => Math.random() - 0.5);
          const mapped = shuffled.slice(0, 5).map(b => ({
            ...b,
            coverUrl: extractCoverUrl(b),
          }));
          setAiRecs(mapped);
        }
      } catch (dbErr) {
        setAiRecs([]);
      }
    } catch (err) {
      setAiRecs([]);
    }
  };

  if (loading) {
    return (
      <div className={styles['activitydashboard-main']} data-theme={theme}>
        <div className={styles['dashboard-container']}>
          <div className={styles['loading-overlay']}>
            <div className={styles.spinner}></div>
            <p style={{ fontSize: '1.2rem', fontWeight: '600', opacity: 0.7 }}>Loading your library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={styles['activitydashboard-main']} data-theme={theme}>
      <div className={styles['dashboard-container']}>
        
        {/* Top Navigation */}
        <div className={styles['top-nav']}>
          <div className={styles['theme-pill']}>
            <button
              className={`${styles['theme-btn']} ${theme === 'light' ? styles['theme-btn-active'] : ''}`}
              onClick={() => setTheme('light')}
            >
              ☀️ Light
            </button>
            <button
              className={`${styles['theme-btn']} ${theme === 'dark' ? styles['theme-btn-active'] : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Dark
            </button>
            <button
              className={`${styles['theme-btn']} ${theme === 'sepia' ? styles['theme-btn-active'] : ''}`}
              onClick={() => setTheme('sepia')}
            >
              📜 Sepia
            </button>
          </div>
          
          {authUser && authUser.role !== 'ADMIN' && (
            <button
              onClick={() => setShowAdminModal(true)}
              className={styles['hero-btn-secondary']}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              🔑 Admin Access
            </button>
          )}

          {/* Developer Test Toggle */}
          <button
            onClick={() => setTestMode(!testMode)}
            className={styles['theme-btn']}
            style={{ 
              background: testMode ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
              color: testMode ? 'var(--secondary-deep-green)' : 'var(--text-muted)',
              border: testMode ? 'none' : '1px solid rgba(255,255,255,0.1)',
              marginLeft: '1rem'
            }}
          >
            🧪 {testMode ? 'Mock Data ON' : 'Live Data'}
          </button>
        </div>

        {testMode && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>MOCK CONTROLS:</span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Books Read:</label>
              <input 
                type="range" min="0" max="25" 
                value={testStats.booksRead} 
                onChange={(e) => setTestStats({...testStats, booksRead: parseInt(e.target.value)})} 
              />
              <span style={{ fontWeight: 700 }}>{testStats.booksRead}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-primary)'
          }}>
            <AlertCircle size={20} color="currentColor" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Premium 3D Hero Section */}
        {currentBook ? (
          <section className={styles['hero-3d-section']}>
            <div className={styles['floating-badge-1']}>⭐</div>
            <div className={styles['floating-badge-2']}>📖</div>
            <div className={styles['floating-badge-3']}>✨</div>
            <div className={styles['floating-badge-4']}>🔥</div>
            <div className={styles['floating-badge-5']}>⚡</div>

            {/* Navigation arrows - Left */}
            {history.length > 1 && (
              <button
                className={styles['hero-nav-arrow']}
                onClick={goToPreviousBook}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ❮
              </button>
            )}

            <div className={styles['hero-3d-container']}>
              <div className={styles['hero-book-3d']}>
                {currentBook?.coverUrl ? (
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className={styles['hero-book-3d-cover']}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={styles['hero-book-3d-empty']}
                  style={{ display: currentBook?.coverUrl ? 'none' : 'flex' }}
                >
                  📕
                </div>
              </div>

              <div className={styles['hero-3d-content']}>
                <div className={styles['hero-status-label']}>
                  <Sparkles size={14} /> RESUME READING
                </div>

                <h1 className={styles['hero-3d-title']}>
                  {currentBook.title || 'Untitled Book'}
                </h1>

                <p className={styles['hero-3d-author']}>
                  {`by ${currentBook.author || 'Unknown Author'}`}
                </p>

                <div className={styles['hero-quick-stats']}>
                  <div className={styles['stat-box']}>
                    <span className={styles['stat-value']}>
                      {Math.round(((currentBook.currentPage || 0) / Math.max(currentBook.totalPages || 1, 1)) * 100)}%
                    </span>
                    <span className={styles['stat-label']}>COMPLETE</span>
                  </div>
                  <div className={styles['stat-box']}>
                    <span className={styles['stat-value']}>
                      {currentBook.currentPage || 0}
                    </span>
                    <span className={styles['stat-label']}>PAGES</span>
                  </div>
                  <div className={styles['stat-box']}>
                    <span className={styles['stat-value']}>
                      {Math.max(0, (currentBook.totalPages || 0) - (currentBook.currentPage || 0))}
                    </span>
                    <span className={styles['stat-label']}>LEFT</span>
                  </div>
                </div>

                <div className={styles['hero-progress-section']}>
                  <div className={styles['progress-bar-bg']}>
                    <div
                      className={styles['progress-bar-fill']}
                      style={{
                        width: `${Math.min(100, ((currentBook.currentPage || 0) / Math.max(currentBook.totalPages || 1, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className={styles['hero-actions']}>
                  <button
                    className={styles['hero-btn-primary']}
                    onClick={() => navigate(`/reading/${currentBook.bookId || currentBook.id}?page=${currentBook.currentPage || 1}`)}
                  >
                    <PlayCircle size={18} /> Continue Reading
                  </button>
                  <button
                    className={styles['hero-btn-secondary']}
                    onClick={async () => {
                      try {
                        const apiUrl = getApiUrl();
                        const res = await fetch(`${apiUrl}/bookshelf/add`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: authUser?.id || 1,
                            title: currentBook.title,
                            author: currentBook.author || 'Unknown',
                            emoji: '❤️',
                            genre: currentBook.category || 'General',
                            rating: 0,
                            status: 'new',
                            progress: 0,
                            listName: 'favourites',
                            coverImage: currentBook.coverUrl || ''
                          })
                        });
                        if (res.ok) alert(`❤️ "${currentBook.title}" added to favorites!`);
                        else alert('❌ Failed to add to favorites');
                      } catch (err) { alert('Error adding book to favorites'); }
                    }}
                  >
                    <Award size={18} /> Favourite
                  </button>
                </div>

                {/* Book indicators - dots */}
                {history.length > 1 && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginTop: '20px'
                  }}>
                    {history.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentBookIndex(idx);
                          setCurrentBook(history[idx]);
                        }}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          border: 'none',
                          background: idx === currentBookIndex ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={history[idx].title}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation arrows - Right */}
            {history.length > 1 && (
              <button
                className={styles['hero-nav-arrow']}
                onClick={goToNextBook}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ❯
              </button>
            )}
          </section>
        ) : (
          <section className={styles['hero-3d-section']} style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <Activity size={50} style={{ margin: '0 auto 1.5rem', color: 'var(--accent-gold)' }} />
              <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>No reading activity yet</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Start your literary journey to see your progress here.</p>
            </div>
          </section>
        )}

        <section>
          <h2 className={styles['section-header']}>
            <Activity size={28} /> Activity & Recent Progress
          </h2>

          {history && history.length > 0 ? (
            <div className={styles['activity-grid']}>
              {history.map((book) => (
                <div
                  key={book.id}
                  className={styles['activity-card']}
                  onClick={() => navigate(`/reading/${book.bookId || book.id}?page=${book.currentPage || 1}`)}
                >
                  {book.coverUrl && (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className={styles['activity-card-image']}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className={styles['activity-card-info']}>
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    
                    {book.totalPages > 0 && (
                      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <div className={styles['activity-progress-text']}>
                           <span>Progress</span>
                           <span>{Math.round(((book.currentPage || 0) / book.totalPages) * 100)}%</span>
                        </div>
                        <div className={styles['activity-progress-bar']}>
                          <div
                            className={styles['activity-progress-fill']}
                            style={{
                              width: `${Math.min(100, ((book.currentPage || 0) / book.totalPages) * 100)}%`,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                        <button className={styles['activity-card-btn']}>Resume Reading</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
              border: '1px solid rgba(0,0,0,0.05)',
              marginBottom: '4rem'
            }}>
              <p>No activity yet. Start reading to see your progress!</p>
            </div>
          )}
        </section>

        {/* THE LITERARY PULSE (Modern Analytical Dashboard) */}
        {(testMode ? testStats : stats) && (
          <section className={styles['pulse-section']}>
            <div className={styles['pulse-header']}>
              <div className={styles['pulse-title-wrap']}>
                <span className={styles['pulse-subtitle']}>Analytical Overview</span>
                <h2 className={styles['pulse-title']}>The Literary Pulse</h2>
              </div>
              <div className={styles['spectrum-wrap']}>
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div 
                    key={i} 
                    className={styles['spectrum-bar']} 
                    style={{ height: `${h}%`, transitionDelay: `${i * 0.1}s` }}
                    title={`Day ${i + 1}: ${h}% Intensity`}
                  />
                ))}
              </div>
            </div>

            <div className={styles['pulse-grid']}>
              {/* Velocity Card */}
              <div className={`${styles['pulse-card']} ${styles['glow-animation']}`}>
                <div className={`${styles['pulse-icon-glow']} ${styles['emerald-glow']}`}>
                  <Activity size={28} />
                </div>
                <div className={styles['pulse-value']}>{(testMode ? testStats : stats).readingVelocity || 0}</div>
                <div className={styles['pulse-label']}>Reading Tempo</div>
              </div>

              {/* Streak Card */}
              <div className={styles['pulse-card']}>
                <div className={`${styles['pulse-icon-glow']} ${styles['gold-glow']}`}>
                  <Award size={28} />
                </div>
                <div className={styles['pulse-value']}>{(testMode ? testStats : stats).currentStreak || 0}</div>
                <div className={styles['pulse-label']}>Sustenance Flame</div>
              </div>

              {/* Books Completed Card */}
              <div className={styles['pulse-card']}>
                <div className={`${styles['pulse-icon-glow']} ${styles['purple-glow']}`}>
                  <Book size={28} />
                </div>
                <div className={styles['pulse-value']}>{(testMode ? testStats : stats).booksRead || 0}</div>
                <div className={styles['pulse-label']}>Volumes Unveiled</div>
              </div>

              {/* Mastery Tier Section */}
              <div className={styles['tier-section']}>
                <div className={styles['tier-badge-visual']}>
                  {(testMode ? testStats : stats).booksRead > 10 ? '🧙‍♂️' : (testMode ? testStats : stats).booksRead > 5 ? '📖' : '🌱'}
                </div>
                <div className={styles['tier-content']}>
                  <div className={styles['tier-name']}>
                    {(testMode ? testStats : stats).booksRead > 10 ? 'Eternal Scholar' : (testMode ? testStats : stats).booksRead > 5 ? 'Diligent Sage' : 'Novice Observer'}
                  </div>
                  <div className={styles['pulse-subtitle']}>Path to Literary Mastery</div>
                  <div className={styles['tier-progress-track']}>
                    <div 
                      className={styles['tier-progress-fill']} 
                      style={{ width: `${Math.min(100, ((testMode ? testStats : stats).booksRead / 20) * 100)}%` }} 
                    />
                  </div>
                  <div className={styles['tier-next']}>
                    <span>Current Level: {Math.floor((testMode ? testStats : stats).booksRead / 2) + 1}</span>
                    <span>Next Tier: {Math.min(100, Math.round(((testMode ? testStats : stats).booksRead / 20) * 100))}% toward Ascension</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {aiRecs && aiRecs.length > 0 && (
          <section>
            <h2 className={styles['section-header']}>
              <Sparkles size={28} color="#fbbf24" /> AI Recommendations
            </h2>
            <div className={styles['recommendations-grid']}>
              {aiRecs.map((book, idx) => (
                <article
                  key={idx}
                  className={styles['recommendation-card']}
                  onClick={() => navigate(`/reading/${book.bookId || book.id}?page=1`)}
                >
                  <div className={styles['rec-image-wrapper']}>
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className={styles['rec-image']}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      height: '100%',
                      background: '#f1f5f9',
                      display: book.coverUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>📖</div>
                    {book.matchScore > 0 && (
                      <div className={styles['rec-badge']}>
                        {Math.round(book.matchScore)}% Match
                      </div>
                    )}
                  </div>
                  <div className={styles['rec-content']}>
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {showAdminModal && (
        <AdminAccessModal
          user={authUser}
          onClose={() => setShowAdminModal(false)}
          onRoleUpdated={handleRoleUpdated}
        />
      )}
    </main>
  );
};

export default ActivityDashboard;