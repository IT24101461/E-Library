import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
import * as pdfjsLib from 'pdfjs-dist';
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
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setAuthUser(JSON.parse(raw));
  }, []);
  const userId = authUser ? authUser.id : 1;
  const saveTimeoutRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const WORDS_PER_PAGE = 250;

  useEffect(() => {
    // If URL had a ?page= param, set that as initial page before loading content
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) setCurrentPage(p);
    }

    fetchData();
    // detect an active reading session started elsewhere (HistoryCard 'Continue')
    try {
      const sessRaw = sessionStorage.getItem('readingSession');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess && String(sess.bookId) === String(bookId)) {
          // compute elapsed so far
          const started = Number(sess.start || Date.now());
          const now = Date.now();
          setPagesReadDuringSession(Number(sess.pages || 0));
          setElapsed(Math.floor((now - started) / 1000));
          setIsTiming(true);
          // start interval
          sessionTimerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [bookId]);

  // Render PDF page when currentPage changes
  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      renderPDFPage(currentPage);
    } else if (!pdfDoc && fullContent) {
      // Handle text content pagination
      updateTextPage(currentPage);
    }
  }, [pdfDoc, currentPage, fullContent, zoom]);

  // Auto-save effect
  useEffect(() => {
    if (currentPage !== lastSavedPage && book && currentPage > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentPage, book]);

  const loadPDF = async (pdfUrl) => {
    try {
      // Handle both URLs and base64 encoded PDFs
      let source = pdfUrl;
      if (pdfUrl && pdfUrl.startsWith('data:')) {
        // Base64 PDF
        source = pdfUrl;
      } else if (pdfUrl) {
        // URL or file path
        source = pdfUrl;
      }

      const pdf = await pdfjsLib.getDocument(source).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      // preserve any pre-set currentPage (from query param or restored progress)
      setCurrentPage((prev) => (prev && prev > 1 ? prev : 1));
    } catch (err) {
      console.warn('Error loading PDF:', err);
      setError('Could not load PDF. Trying fallback text content...');
      // Fallback to text content
    }
  };

  const renderPDFPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Compute a responsive scale so PDF fits its container width
      const unscaledViewport = page.getViewport({ scale: 1 });
      const container = canvas.parentElement;
      const containerWidth = (container && container.clientWidth) || unscaledViewport.width;
      // scale to fit container width, limit base scale to 1.5 for quality/stability
      const baseScale = Math.min(1.5, containerWidth / unscaledViewport.width);
      const scale = Math.max(0.5, Math.min(3, baseScale * zoom));
      const viewport = page.getViewport({ scale });

      // Set canvas size based on page dimensions
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Render the page into the canvas
      const renderContext = { canvasContext: context, viewport };
      await page.render(renderContext).promise;

      // Smoothly bring reading canvas into view for focus
      try { canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}

      // Extract text content
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      setPageContent(text);
    } catch (err) {
      console.error('Error rendering PDF page:', err);
      setPageContent('Error rendering page content');
    }
  };

  const updateTextPage = (pageNum) => {
    if (!fullContent) return;

    if (pageNum === 1) {
      // First page shows title and author
      setPageContent(fullContent);
      return;
    }

    // Split content into words and calculate pages
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
      const next = currentPage + 1;
      // if session running and moving forward, count pages read
      if (isTiming && next > currentPage) {
        setPagesReadDuringSession((p) => p + (next - currentPage));
      }
      setCurrentPage(next);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      // moving backwards shouldn't increment pages read
      setCurrentPage(prev);
    }
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAutoSave = async () => {
    if (saving || !book || currentPage === lastSavedPage) return;

    setSaving(true);
    try {
      console.log(`[AutoSave] Saving: userId=${userId}, bookId=${bookId}, currentPage=${currentPage}, totalPages=${totalPages}`);
      const response = await ActivityService.logActivity(userId, 'READ', bookId, {
        progress: Math.round((currentPage / totalPages) * 100),
        currentPage: currentPage,
        totalPages: totalPages
      });
      console.log('[AutoSave] Success:', response);
      setLastSavedPage(currentPage);
    } catch (err) {
      console.error('[AutoSave] Failed:', err);
      console.error('[AutoSave] Error details:', err.response?.data || err.message);
    } finally {
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
      const uid = authUser ? authUser.id : 1;
      const pages = Number(pagesReadDuringSession || 0);
      const prev = Number(currentPage || 1);
      const newCurrent = Math.min(prev + pages, totalPages || Number.MAX_SAFE_INTEGER);

      // update backend progress
      await ActivityService.updateProgress({ userId: uid, bookId, currentPage: newCurrent, totalPages });

      // clear session storage for this book
      try { sessionStorage.removeItem('readingSession'); } catch (e) {}

      // notify other components (dashboard) to refresh
      const ev = new CustomEvent('progressUpdated', { detail: { bookId, currentPage: newCurrent } });
      window.dispatchEvent(ev);
    } catch (err) {
      console.error('Failed to stop session and save progress', err);
    } finally {
      setPagesReadDuringSession(0);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Real API call to fetch book details
      const response = await ActivityService.getBook(bookId);
      const currentBook = response.data;
      setBook(currentBook);

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

  const isCompleted = currentPage >= totalPages;

  return (
    <div className={`${styles['reading-container']} ${focusMode ? styles.focused : ''}`}>
      {loading ? (
        <div className={styles['reading-loading']}>Loading book content...</div>
      ) : error ? (
        <div className={styles['reading-error']}>{error}</div>
      ) : (
        <>
          {/* Header */}
          <div className={styles['reading-header']}>
            <button
              onClick={() => navigate(-1)}
              className={styles['reading-back-button']}
            >
              ← Back
            </button>
            <button
              onClick={() => setFocusMode((s) => !s)}
              className={styles['reading-back-button']}
              style={{ marginLeft: 12 }}
            >
              {focusMode ? 'Exit Focus' : 'Focus Mode'}
            </button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 12 }}>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                className={styles['reading-action-button']}
                title="Zoom out"
              >
                −
              </button>
              <div style={{ minWidth: 44, textAlign: 'center', color: '#4f46e5', fontWeight: 700 }}>{Math.round(zoom * 100)}%</div>
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className={styles['reading-action-button']}
                title="Zoom in"
              >
                +
              </button>

              <button
                onClick={async () => {
                  try {
                    if (!book || !book.pdfUrl) return;
                    const url = book.pdfUrl;
                    // If data URL, download directly
                    if (url.startsWith('data:')) {
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(book.title || 'book').replace(/[^a-z0-9]/gi, '_')}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      return;
                    }
                    // Otherwise fetch blob and trigger download
                    const resp = await fetch(url);
                    const blob = await resp.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = `${(book.title || 'book').replace(/[^a-z0-9]/gi, '_')}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                  } catch (e) {
                    console.error('Download failed', e);
                  }
                }}
                className={styles['reading-action-button']}
                title="Download PDF"
              >
                ⬇️
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
                <div
                  className={styles['reading-progress-fill']}
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                ></div>
              </div>
                {saving && <span className={styles['reading-saving']}>Saving...</span>}
                {isTiming && (
                  <div className="ml-4 flex items-center gap-3">
                    <div className="text-sm text-white">
                      ⏱ {Math.floor(elapsed / 60)}m {elapsed % 60}s
                    </div>
                    <div className="text-sm text-white">Pages: {pagesReadDuringSession}</div>
                    <button onClick={stopSession} className="px-2 py-1 bg-yellow-400 text-black rounded">Stop</button>
                  </div>
                )}
            </div>
          </div>

          <div className={styles['reading-content-area']}>
            {pdfDoc ? (
              <div className={styles['reading-pdf-container']}>
                <canvas ref={canvasRef} className={styles['reading-pdf-canvas']} />
              </div>
            ) : (
              <div className={styles['reading-text-container']}>
                {currentPage === 1 && (
                  <>
                    <h2 className={styles['reading-intro-title']}>{book?.title}</h2>
                    <h3 className={styles['reading-intro-author']}>By {book?.author}</h3>
                    <div className={styles['reading-intro-divider']}></div>
                    <p className={styles['reading-intro-desc']}>Begin your reading journey...</p>
                  </>
                )}

                {pageContent && (
                  <p className={styles['reading-page-content']}>
                    {pageContent}
                  </p>
                )}

                {!pageContent && currentPage > 1 && (
                  <p className={styles['reading-loading']}>Loading page content...</p>
                )}

                {isCompleted && currentPage > totalPages && (
                  <div className={styles['reading-complete']}>
                    <p className={styles['reading-complete-emoji']}>🎉</p>
                    <p className={styles['reading-complete-title']}>Congratulations!</p>
                    <p className={styles['reading-complete-desc']}>You have completed "{book?.title}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Footer with Navigation */}
          <div className={styles['reading-footer']}>
            <div className={styles['reading-footer-row']}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={styles['reading-btn-prev']}
              >
                ← Previous
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

                  />
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className={styles['reading-btn-next']}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>


        </>
      )}
    </div>
  );
};

export default Reading;
