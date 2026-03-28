import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
import { ReaderService } from '../services/ReaderService';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Maximize, Minimize, ZoomOut, ZoomIn, Download, 
  ChevronLeft, ChevronRight, Clock, Award, Bookmark as BookmarkIcon, 
  Trash2, Plus, Type, Palette, Contrast, Layout
} from 'lucide-react';
import styles from './Reading.module.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Reading = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSavedPage, setLastSavedPage] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageContent, setPageContent] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [isTiming, setIsTiming] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pagesReadDuringSession, setPagesReadDuringSession] = useState(0);
  const [authUser, setAuthUser] = useState(null);
  
  // Reader Settings State
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [theme, setTheme] = useState('dark'); // 'dark', 'sepia', 'light'
  const [highContrast, setHighContrast] = useState(false);
  
  const [direction, setDirection] = useState(1); 
  
  // Bookmarks and Highlights State
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        setAuthUser(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        setAuthUser(null);
      }
    }
  }, []);
  
  const userId = authUser?.id || 1;
  const saveTimeoutRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const savingInProgressRef = useRef(false);
  const lastSentPageRef = useRef(0);
  const WORDS_PER_PAGE = 250;

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) setCurrentPage(p);
    }
    fetchData();
    fetchReaderData(); // Fetch marks
    
    try {
      const sessRaw = sessionStorage.getItem('readingSession');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess && String(sess.bookId) === String(bookId)) {
          const started = Number(sess.start || Date.now());
          const now = Date.now();
          setPagesReadDuringSession(Number(sess.pages || 0));
          setElapsed(Math.floor((now - started) / 1000));
          setIsTiming(true);
          sessionTimerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        }
      }
    } catch (e) {}
  }, [bookId, userId]);

  const fetchReaderData = async () => {
    try {
      const bRes = await ReaderService.getBookmarks(userId, bookId);
      const hRes = await ReaderService.getHighlights(userId, bookId);
      setBookmarks(bRes.data || []);
      setHighlights(hRes.data || []);
    } catch (err) {
      console.warn("Could not fetch bookmarks or highlights", err);
    }
  };

  // Render PDF page when currentPage changes
  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      renderPDFPage(currentPage);
    } else if (!pdfDoc && fullContent) {
      updateTextPage(currentPage);
    }
  }, [pdfDoc, currentPage, fullContent, zoom]);

  useEffect(() => {
    if (currentPage !== lastSavedPage && book && currentPage > 0) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        if (!savingInProgressRef.current && currentPage !== lastSentPageRef.current) {
          handleAutoSave();
        }
      }, 2000);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [currentPage, book]);

  // Apply body classes for global theme/contrast over text
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    return () => document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const loadPDF = async (pdfUrl) => {
    try {
      let source = pdfUrl;
      const pdf = await pdfjsLib.getDocument(source).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage((prev) => (prev && prev > 1 ? prev : 1));
    } catch (err) {
      setError('Could not load PDF. Trying fallback text content...');
    }
  };

  const renderPDFPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const unscaledViewport = page.getViewport({ scale: 1 });
      const container = canvas.parentElement;
      const containerWidth = (container && container.clientWidth) || unscaledViewport.width;
      const baseScale = Math.min(1.5, containerWidth / unscaledViewport.width);
      const scale = Math.max(0.5, Math.min(3, baseScale * zoom));
      const viewport = page.getViewport({ scale });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;
      try { canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}

      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      setPageContent(text);
    } catch (err) {
      setPageContent('Error rendering page content');
    }
  };

  const updateTextPage = (pageNum) => {
    if (!fullContent) return;
    if (pageNum === 1) {
      setPageContent(fullContent);
      return;
    }
    const words = fullContent.split(/\s+/).filter(word => word.length > 0);
    const startIndex = (pageNum - 1) * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, words.length);
    if (startIndex >= words.length) {
      setPageContent('');
      return;
    }
    setPageContent(words.slice(startIndex, endIndex).join(' '));
    setTotalPages(Math.ceil(words.length / WORDS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setDirection(1);
      const next = currentPage + 1;
      if (isTiming && next > currentPage) setPagesReadDuringSession((p) => p + (next - currentPage));
      setCurrentPage(next);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setDirection(page > currentPage ? 1 : -1);
      setCurrentPage(page);
    }
  };

  const handleAutoSave = async () => {
    if (savingInProgressRef.current || !book || currentPage === lastSavedPage) return;
    savingInProgressRef.current = true;
    setSaving(true);
    try {
      await ActivityService.logActivity(userId, 'READ', bookId, {
        progress: Math.round((currentPage / totalPages) * 100),
        currentPage: currentPage,
        totalPages: totalPages
      });
      setLastSavedPage(currentPage);
      lastSentPageRef.current = currentPage;
    } catch (err) {
    } finally {
      savingInProgressRef.current = false;
      setSaving(false);
    }
  };

  const stopSession = async () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    setIsTiming(false);
    try {
      const newCurrent = Math.min(Number(currentPage || 1) + Number(pagesReadDuringSession || 0), totalPages || Number.MAX_SAFE_INTEGER);
      await ActivityService.updateProgress({ userId, bookId, currentPage: newCurrent, totalPages });
      
      // Log explicitly for velocity tracking
      const minutes = Math.max(1, Math.floor(elapsed / 60));
      await ActivityService.logActivity(userId, 'SESSION', bookId, {
        currentPage: pagesReadDuringSession, // Used as 'pagesRead' by backend for SESSION logs
        timeSpentMinutes: minutes
      });
      
      try { sessionStorage.removeItem('readingSession'); } catch (e) {}
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { bookId, currentPage: newCurrent } }));
    } catch (err) {} finally {
      setPagesReadDuringSession(0);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ActivityService.getBook(bookId);
      const currentBook = response.data;
      setBook(currentBook);
      
      try {
          const statsResponse = await ActivityService.getStats(userId);
          setStats(statsResponse.data);
      } catch (err) {
          console.warn("Could not fetch user stats", err);
          setStats({ readingVelocity: 0 });
      }

      if (currentBook.pdfUrl) {
        await loadPDF(currentBook.pdfUrl);
      } else if (currentBook.content) {
        setFullContent(currentBook.content);
      } else {
        setError('No readable content available for this book.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load book data');
    } finally {
      setLoading(false);
    }
  };

  // --- Bookmark and Highlight Actions ---
  const handleAddBookmark = async () => {
    try {
      const res = await ReaderService.addBookmark({ 
        userId: Number(userId), 
        bookId: Number(bookId), 
        pageNumber: Number(currentPage) 
      });
      if (res.data) {
        setBookmarks([...bookmarks, res.data]);
      }
    } catch (err) {
      console.error('Failed to add bookmark', err);
      alert('Failed to save bookmark. Did you restart the Spring Boot backend?');
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await ReaderService.deleteBookmark(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete bookmark', err);
    }
  };

  const handleAddHighlight = async () => {
    try {
      // Simulate selecting some text or just highlight the page
      const res = await ReaderService.addHighlight({ 
        userId: Number(userId), 
        bookId: Number(bookId), 
        pageNumber: Number(currentPage), 
        content: `Highlighted Page ${currentPage}`, 
        color: 'yellow' 
      });
      if (res.data) {
         setHighlights([...highlights, res.data]);
      }
    } catch (err) {
      console.error('Failed to add highlight', err);
      alert('Failed to save highlight. Did you restart the Spring Boot backend?');
    }
  };

  const isCompleted = currentPage >= totalPages;
  const themeClass = theme === 'light' ? styles['theme-light'] : theme === 'sepia' ? styles['theme-sepia'] : '';

  return (
    <div className={`${styles['reading-container']} ${focusMode ? styles.focused : ''} ${themeClass}`}>
      {loading ? (
        <div className={styles['reading-loading']}>Loading book content...</div>
      ) : error ? (
        <div className={styles['reading-error']}>{error}</div>
      ) : (
        <div className={styles['reading-main-layout']}>
          {/* Main Content Area */}
          <div className={styles['reading-content-wrapper']}>
            
            {/* Header */}
            <div className={styles['reading-header']}>
              <button onClick={() => navigate(-1)} className={styles['reading-back-button']}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                onClick={() => setFocusMode(!focusMode)} 
                className={styles['reading-back-button']} 
                style={{ marginLeft: 12 }}
              >
                {focusMode ? <><Minimize size={16} /> Exit Focus</> : <><Maximize size={16} /> Focus Mode</>}
              </button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 12 }}>
                <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} className={styles['reading-action-button']} title="Zoom out">
                  <ZoomOut size={16} />
                </button>
                <div style={{ minWidth: 44, textAlign: 'center', color: 'var(--accent-color)', fontWeight: 700 }}>{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} className={styles['reading-action-button']} title="Zoom in">
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (!book || !book.pdfUrl) return;
                      const url = book.pdfUrl;
                      if (url.startsWith('data:')) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${(book.title || 'book').replace(/[^a-z0-9]/gi, '_')}.pdf`;
                        document.body.appendChild(a); a.click(); a.remove();
                        return;
                      }
                      const resp = await fetch(url);
                      const blob = await resp.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = blobUrl;
                      a.download = `${(book.title || 'book').replace(/[^a-z0-9]/gi, '_')}.pdf`;
                      document.body.appendChild(a); a.click(); a.remove();
                      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                    } catch (e) {
                      console.error('Download failed', e);
                    }
                  }}
                  className={styles['reading-action-button']}
                  title="Download PDF"
                  style={{ marginLeft: 8 }}
                >
                  <Download size={16} />
                </button>
              </div>
              <div className={styles['reading-title-section']}>
                <h1 className={styles['reading-title']}>{book?.title}</h1>
                <span className={styles['reading-author']}>{book?.author}</span>
              </div>
              <div className={styles['reading-progress-section']}>
                <span className={styles['reading-progress-text']}>
                  Page {currentPage} of {totalPages}
                </span>
                <div className={styles['reading-progress-bar']}>
                  <div className={styles['reading-progress-fill']} style={{ width: `${(currentPage / totalPages) * 100}%` }}></div>
                </div>
                {saving && <span className={styles['reading-saving']}>Saving...</span>}
                {isTiming && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color:'var(--text-main)' }}>
                      <Clock size={14} /> {Math.floor(elapsed / 60)}m {elapsed % 60}s
                    </div>
                    <div className="text-sm" style={{color:'var(--text-main)'}}>Pages: {pagesReadDuringSession}</div>
                    <button onClick={stopSession} className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">Stop Session</button>
                  </div>
                )}
              </div>
            </div>



            {/* Reading Content */}
            <div className={styles['reading-content-area']}>
              {pdfDoc ? (
                <div className={styles['reading-pdf-container']}>
                  <canvas 
                    ref={canvasRef} 
                    className={styles['reading-pdf-canvas']} 
                    style={{ filter: `brightness(${brightness}%) ${highContrast ? 'contrast(120%) saturate(150%)' : ''}` }}
                  />
                </div>
              ) : (
                <div className={styles['reading-text-wrapper']}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentPage}
                      custom={direction}
                      initial={{ rotateY: direction === 1 ? -90 : 90, opacity: 0, x: direction === 1 ? 50 : -50 }}
                      animate={{ rotateY: 0, opacity: 1, x: 0 }}
                      exit={{ rotateY: direction === 1 ? 90 : -90, opacity: 0, x: direction === 1 ? -50 : 50 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className={styles['reading-text-container']}
                    >
                      {currentPage === 1 && (
                        <>
                          <h2 className={styles['reading-intro-title']}>{book?.title}</h2>
                          <h3 className={styles['reading-intro-author']}>By {book?.author}</h3>
                          <div className={styles['reading-intro-divider']}></div>
                          <p className={styles['reading-intro-desc']}>Begin your reading journey...</p>
                        </>
                      )}

                      {pageContent && (
                        <p className={styles['reading-page-content']} style={{ filter: `brightness(${brightness}%)` }}>
                          {pageContent}
                        </p>
                      )}

                      {!pageContent && currentPage > 1 && (
                        <p className={styles['reading-loading']}>Loading page content...</p>
                      )}

                      {isCompleted && currentPage > totalPages && (
                        <div className={styles['reading-complete']}>
                          <div className={styles['reading-complete-emoji']}><Award size={80} color="var(--accent-color)" /></div>
                          <p className={styles['reading-complete-title']}>Congratulations!</p>
                          <p className={styles['reading-complete-desc']}>You have completed "{book?.title}"</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles['reading-footer']}>
              <div className={styles['reading-footer-row']}>
                <button onClick={handlePrevPage} disabled={currentPage === 1} className={styles['reading-btn-prev']}>
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className={styles['reading-footer-controls']}>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => handleGoToPage(parseInt(e.target.value) || 1)}
                    className={styles['reading-page-input']}
                  />
                  <span className={styles['reading-page-total-label']}>/ {totalPages}</span>
                  <div className={styles['reading-slider-container']}>
                    <input
                      type="range"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => handleGoToPage(parseInt(e.target.value) || 1)}
                      className={styles['custom-slider']}
                    />
                  </div>
                </div>
                
                <div style={{display:'flex', gap:'8px'}}>
                  <button onClick={handleNextPage} disabled={currentPage >= totalPages} className={styles['reading-btn-next']}>
                    Next <ChevronRight size={16} />
                  </button>
                  <button onClick={handleAddHighlight} className={styles['reading-btn-highlight']} title="Highlight this page">
                    Highlight
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar (Settings & Bookmarks) */}
          <div className={styles['reading-sidebar']}>
            
            {/* Focus Mode Toggle (Always visible) */}
            <div className={styles['sidebar-panel']} style={{ padding: '12px 20px' }}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    {focusMode ? <Minimize size={16} color="var(--accent-color)" /> : <Maximize size={16} color="var(--text-muted)" />}
                    <span className={styles['sidebar-setting-title']}>Focus Mode</span>
                  </div>
                  <div className={styles['switch-container']}>
                    <label className={styles['switch']}>
                      <input type="checkbox" checked={focusMode} onChange={(e) => setFocusMode(e.target.checked)} />
                      <span className={styles['slider']}></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Zoom Level Panel */}
            <div className={styles['sidebar-panel']}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <ZoomIn size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Zoom Level</span>
                  </div>
                  <span className={styles['sidebar-setting-value']}>{Math.round(zoom * 100)}%</span>
                </div>
                <span className={styles['sidebar-setting-subtitle']}>Adjust page magnification</span>
                <input 
                  type="range" min="0.5" max="3.0" step="0.1" value={zoom} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className={styles['custom-slider']} style={{marginTop: 8}}
                />
              </div>
            </div>

            {/* Brightness Panel */}
            <div className={styles['sidebar-panel']}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <Layout size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Page Brightness</span>
                  </div>
                  <span className={styles['sidebar-setting-value']}>{brightness}%</span>
                </div>
                <span className={styles['sidebar-setting-subtitle']}>Adjust reading comfort</span>
                <input 
                  type="range" min="50" max="150" step="1" value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))} 
                  className={styles['custom-slider']} style={{marginTop: 8}}
                />
              </div>
            </div>

            {/* Theme Panel */}
            <div className={styles['sidebar-panel']}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <Palette size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Theme</span>
                  </div>
                </div>
                <span className={styles['sidebar-setting-subtitle']} style={{marginBottom: 8}}>Dark / Sepia / Light</span>
                <div className={styles['theme-options']}>
                  <button className={`${styles['theme-btn']} ${theme === 'dark' ? styles['active'] : ''}`} onClick={() => setTheme('dark')}>Dark</button>
                  <button className={`${styles['theme-btn']} ${theme === 'sepia' ? styles['active'] : ''}`} onClick={() => setTheme('sepia')}>Sepia</button>
                  <button className={`${styles['theme-btn']} ${theme === 'light' ? styles['active'] : ''}`} onClick={() => setTheme('light')}>Light</button>
                </div>
              </div>
            </div>

            {/* High Contrast */}
            <div className={styles['sidebar-panel']}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']} style={{marginBottom: 4}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <Contrast size={16} color="var(--text-muted)" />
                    <div style={{display:'flex', flexDirection:'column'}}>
                      <span className={styles['sidebar-setting-title']}>High Contrast</span>
                      <span className={styles['sidebar-setting-subtitle']}>Better readability</span>
                    </div>
                  </div>
                  <div className={styles['switch-container']}>
                    <label className={styles['switch']}>
                      <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
                      <span className={styles['slider']}></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookmarks */}
            <div className={styles['sidebar-panel']} style={{flex: 1, justifyContent:'flex-start'}}>
              <div className={styles['bookmarks-header']}>
                <div style={{display:'flex', flexDirection:'column'}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <BookmarkIcon size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Bookmarks</span>
                  </div>
                  <span className={styles['sidebar-setting-subtitle']}>Create / Open / Delete</span>
                  <span className={styles['sidebar-setting-subtitle']} style={{marginTop:4, color:'var(--accent-color)'}}>Current Page: {currentPage}</span>
                </div>
                <button className={styles['btn-add']} onClick={handleAddBookmark}>
                  <Plus size={14} /> Add
                </button>
              </div>
              
              <div className={styles['bookmark-list']} style={{marginTop: 12}}>
                {bookmarks.length === 0 ? (
                  <div className={styles['empty-state']}>No bookmarks yet.</div>
                ) : (
                  bookmarks.map(bm => (
                    <div key={bm.id} className={styles['bookmark-item']} onClick={() => handleGoToPage(bm.pageNumber)}>
                      <div style={{display:'flex', flexDirection:'column'}}>
                        <span className={styles['bookmark-page']}>Page {bm.pageNumber}</span>
                        <span className={styles['bookmark-date']}>{new Date(bm.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button className={styles['bookmark-delete']} onClick={(e) => { e.stopPropagation(); handleDeleteBookmark(bm.id); }} title="Remove bookmark">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Reading;
