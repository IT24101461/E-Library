import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
import { ReaderService } from '../services/ReaderService';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Maximize, Minimize, ZoomOut, ZoomIn, Download,
  ChevronLeft, ChevronRight, Clock, Award, Bookmark as BookmarkIcon,
  Trash2, Plus, Type, Palette, Contrast, Layout, Menu, X, Highlighter
} from 'lucide-react';
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
import { ReaderService } from '../services/ReaderService';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Maximize, Minimize, ZoomOut, ZoomIn, Download, 
  ChevronLeft, ChevronRight, Clock, Award, Bookmark as BookmarkIcon, 
  Trash2, Plus, Type, Palette, Contrast, Layout
} from 'lucide-react';
=======
import * as pdfjsLib from 'pdfjs-dist';
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
import styles from './Reading.module.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Reading = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
<<<<<<< HEAD
  const textLayerRef = useRef(null);
=======
<<<<<<< HEAD
  const textLayerRef = useRef(null);
=======
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD

=======
<<<<<<< HEAD

=======
<<<<<<< HEAD
  
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  // Reader Settings State
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [theme, setTheme] = useState('dark'); // 'dark', 'sepia', 'light'
  const [highContrast, setHighContrast] = useState(false);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5

  const [direction, setDirection] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

<<<<<<< HEAD
=======
=======
  
  const [direction, setDirection] = useState(1); 
  
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  // Bookmarks and Highlights State
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD

=======
<<<<<<< HEAD

=======
  
<<<<<<< HEAD
=======
  // IMPORTANT: userId must be recalculated whenever authUser changes
  // This ensures new users are correctly identified
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  const userId = authUser?.id || 1;
  const saveTimeoutRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const savingInProgressRef = useRef(false);
  const lastSentPageRef = useRef(0);
  const WORDS_PER_PAGE = 250;

<<<<<<< HEAD
  const [stats, setStats] = useState(null);

  useEffect(() => {
=======
<<<<<<< HEAD
  const [stats, setStats] = useState(null);

  useEffect(() => {
=======
<<<<<<< HEAD
  const [stats, setStats] = useState(null);

  useEffect(() => {
=======
  useEffect(() => {
    // If URL had a ?page= param, set that as initial page before loading content
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) setCurrentPage(p);
    }
<<<<<<< HEAD
    fetchData();
    fetchReaderData(); // Fetch marks

=======
<<<<<<< HEAD
    fetchData();
    fetchReaderData(); // Fetch marks

=======
<<<<<<< HEAD
    fetchData();
    fetchReaderData(); // Fetch marks
    
=======

    fetchData();
    // detect an active reading session started elsewhere (HistoryCard 'Continue')
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    try {
      const sessRaw = sessionStorage.getItem('readingSession');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess && String(sess.bookId) === String(bookId)) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
          // compute elapsed so far
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
          const started = Number(sess.start || Date.now());
          const now = Date.now();
          setPagesReadDuringSession(Number(sess.pages || 0));
          setElapsed(Math.floor((now - started) / 1000));
          setIsTiming(true);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
          sessionTimerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        }
      }
    } catch (e) { }
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
          sessionTimerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        }
      }
    } catch (e) {}
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
          // start interval
          sessionTimerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [bookId]);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5

  // Render PDF page when currentPage changes
  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      renderPDFPage(currentPage);
    } else if (!pdfDoc && fullContent) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
      // Handle text content pagination
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      updateTextPage(currentPage);
    }
  }, [pdfDoc, currentPage, fullContent, zoom]);

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  useEffect(() => {
    if (currentPage !== lastSavedPage && book && currentPage > 0) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
  // Auto-save effect with improved concurrency handling
  useEffect(() => {
    if (currentPage !== lastSavedPage && book && currentPage > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        // Only save if not already saving and page is different from what was sent
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
        if (!savingInProgressRef.current && currentPage !== lastSentPageRef.current) {
          handleAutoSave();
        }
      }, 2000);
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======

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
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    }
  };

  const renderPDFPage = async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
<<<<<<< HEAD
      const unscaledViewport = page.getViewport({ scale: 1 });
      const container = canvas.parentElement;
      const containerWidth = (container && container.clientWidth) || unscaledViewport.width;
=======
<<<<<<< HEAD
      const unscaledViewport = page.getViewport({ scale: 1 });
      const container = canvas.parentElement;
      const containerWidth = (container && container.clientWidth) || unscaledViewport.width;
=======
<<<<<<< HEAD
      const unscaledViewport = page.getViewport({ scale: 1 });
      const container = canvas.parentElement;
      const containerWidth = (container && container.clientWidth) || unscaledViewport.width;
=======

      // Compute a responsive scale so PDF fits its container width
      const unscaledViewport = page.getViewport({ scale: 1 });
      const container = canvas.parentElement;
      const containerWidth = (container && container.clientWidth) || unscaledViewport.width;
      // scale to fit container width, limit base scale to 1.5 for quality/stability
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      const baseScale = Math.min(1.5, containerWidth / unscaledViewport.width);
      const scale = Math.max(0.5, Math.min(3, baseScale * zoom));
      const viewport = page.getViewport({ scale });

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Force exactly matching container dimensions to prevent CSS squishing which misaligns text
      if (container) {
        container.style.width = `${viewport.width}px`;
        container.style.height = `${viewport.height}px`;
        container.style.maxWidth = '100%';
        container.style.minHeight = 'auto'; // Disable CSS height defaults
      }

      await page.render({ canvasContext: context, viewport }).promise;
      try { canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }

      // Extract and render text layer
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      setPageContent(text);

      // Create selectable text layer - CRITICAL: render immediately
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = '';
        textLayerRef.current.style.position = 'absolute';
        textLayerRef.current.style.top = '0px';
        textLayerRef.current.style.left = '0px';
        textLayerRef.current.style.width = viewport.width + 'px';
        textLayerRef.current.style.height = viewport.height + 'px';
        textLayerRef.current.style.zIndex = '10';
        textLayerRef.current.style.pointerEvents = 'auto';
        textLayerRef.current.style.userSelect = 'text';

        // Ensure no stray scaling is retained
        textLayerRef.current.style.transform = `scale(1)`;
        textLayerRef.current.style.transformOrigin = 'top left';

        // Render text items
        textContent.items.forEach((item) => {
          const span = document.createElement('span');
          const x = item.transform[4];
          const y = viewport.height - item.transform[5];

          span.style.position = 'absolute';
          span.style.left = x + 'px';
          span.style.top = (y - item.height) + 'px';
          span.style.fontSize = item.height + 'px';
          span.style.fontFamily = 'inherit';
          span.style.color = 'transparent';
          span.style.backgroundColor = 'transparent';
          span.style.whiteSpace = 'pre';
          span.style.cursor = 'text';
          span.style.userSelect = 'text';
          span.style.WebkitUserSelect = 'text';
          span.style.lineHeight = item.height + 'px';
          span.textContent = item.str;
          textLayerRef.current.appendChild(span);
        });
      }
    } catch (err) {
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;
      try { canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}

=======
      // Set canvas size based on page dimensions
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Render the page into the canvas
      const renderContext = { canvasContext: context, viewport };
      await page.render(renderContext).promise;

      // Smoothly bring reading canvas into view for focus
      try { canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}

      // Extract text content
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      setPageContent(text);
    } catch (err) {
<<<<<<< HEAD
=======
      console.error('Error rendering PDF page:', err);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      setPageContent('Error rendering page content');
    }
  };

  const updateTextPage = (pageNum) => {
    if (!fullContent) return;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    if (pageNum === 1) {
      setPageContent(fullContent);
      return;
    }
    const words = fullContent.split(/\s+/).filter(word => word.length > 0);
    const startIndex = (pageNum - 1) * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, words.length);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======

    if (pageNum === 1) {
      // First page shows title and author
      setPageContent(fullContent);
      return;
    }

    // Split content into words and calculate pages
    const words = fullContent.split(/\s+/).filter(word => word.length > 0);
    const startIndex = (pageNum - 1) * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, words.length);

>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    if (startIndex >= words.length) {
      setPageContent('');
      return;
    }
    setPageContent(words.slice(startIndex, endIndex).join(' '));
    setTotalPages(Math.ceil(words.length / WORDS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
<<<<<<< HEAD
      setDirection(1);
      const next = currentPage + 1;
      if (isTiming && next > currentPage) setPagesReadDuringSession((p) => p + (next - currentPage));
=======
<<<<<<< HEAD
      setDirection(1);
      const next = currentPage + 1;
      if (isTiming && next > currentPage) setPagesReadDuringSession((p) => p + (next - currentPage));
=======
<<<<<<< HEAD
      setDirection(1);
      const next = currentPage + 1;
      if (isTiming && next > currentPage) setPagesReadDuringSession((p) => p + (next - currentPage));
=======
      const next = currentPage + 1;
      // if session running and moving forward, count pages read
      if (isTiming && next > currentPage) {
        setPagesReadDuringSession((p) => p + (next - currentPage));
      }
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      setCurrentPage(next);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
<<<<<<< HEAD
      setDirection(-1);
      setCurrentPage(currentPage - 1);
=======
<<<<<<< HEAD
      setDirection(-1);
      setCurrentPage(currentPage - 1);
=======
<<<<<<< HEAD
      setDirection(-1);
      setCurrentPage(currentPage - 1);
=======
      const prev = currentPage - 1;
      // moving backwards shouldn't increment pages read
      setCurrentPage(prev);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    }
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
<<<<<<< HEAD
      setDirection(page > currentPage ? 1 : -1);
=======
<<<<<<< HEAD
      setDirection(page > currentPage ? 1 : -1);
=======
<<<<<<< HEAD
      setDirection(page > currentPage ? 1 : -1);
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      setCurrentPage(page);
    }
  };

  const handleAutoSave = async () => {
    if (savingInProgressRef.current || !book || currentPage === lastSavedPage) return;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    savingInProgressRef.current = true;
    setSaving(true);
    try {
      await ActivityService.logActivity(userId, 'READ', bookId, {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======

    savingInProgressRef.current = true;
    setSaving(true);
    try {
      console.log(`[AutoSave] Saving: userId=${userId}, bookId=${bookId}, currentPage=${currentPage}, totalPages=${totalPages}`);
      const response = await ActivityService.logActivity(userId, 'READ', bookId, {
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
        progress: Math.round((currentPage / totalPages) * 100),
        currentPage: currentPage,
        totalPages: totalPages
      });
<<<<<<< HEAD
      setLastSavedPage(currentPage);
      lastSentPageRef.current = currentPage;
    } catch (err) {
=======
<<<<<<< HEAD
      setLastSavedPage(currentPage);
      lastSentPageRef.current = currentPage;
    } catch (err) {
=======
<<<<<<< HEAD
      setLastSavedPage(currentPage);
      lastSentPageRef.current = currentPage;
    } catch (err) {
=======
      console.log('[AutoSave] Success - Data saved for user:', userId, 'Response:', response);
      setLastSavedPage(currentPage);
      lastSentPageRef.current = currentPage;
    } catch (err) {
      console.error('[AutoSave] Failed:', err);
      console.error('[AutoSave] Error details:', err.response?.data || err.message);
      // Don't mark as saved on error, allow retry on next page change
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    try {
      const newCurrent = Math.min(Number(currentPage || 1) + Number(pagesReadDuringSession || 0), totalPages || Number.MAX_SAFE_INTEGER);
      await ActivityService.updateProgress({ userId, bookId, currentPage: newCurrent, totalPages });

<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
    try {
      const newCurrent = Math.min(Number(currentPage || 1) + Number(pagesReadDuringSession || 0), totalPages || Number.MAX_SAFE_INTEGER);
      await ActivityService.updateProgress({ userId, bookId, currentPage: newCurrent, totalPages });
      
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      // Log explicitly for velocity tracking
      const minutes = Math.max(1, Math.floor(elapsed / 60));
      await ActivityService.logActivity(userId, 'SESSION', bookId, {
        currentPage: pagesReadDuringSession, // Used as 'pagesRead' by backend for SESSION logs
        timeSpentMinutes: minutes
      });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5

      try { sessionStorage.removeItem('readingSession'); } catch (e) { }
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { bookId, currentPage: newCurrent } }));
    } catch (err) { } finally {
<<<<<<< HEAD
=======
=======
      
      try { sessionStorage.removeItem('readingSession'); } catch (e) {}
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { bookId, currentPage: newCurrent } }));
    } catch (err) {} finally {
=======

    try {
      const uid = userId; // Use the component-level userId which is always up-to-date
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
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      setPagesReadDuringSession(0);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
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
=======
      // Real API call to fetch book details
      const response = await ActivityService.getBook(bookId);
      const currentBook = response.data;
      setBook(currentBook);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5

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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  // --- Bookmark and Highlight Actions ---
  const handleAddBookmark = async () => {
    try {
      const res = await ReaderService.addBookmark({
        userId: Number(userId),
        bookId: Number(bookId),
        pageNumber: Number(currentPage)
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
  // --- Bookmark and Highlight Actions ---
  const handleAddBookmark = async () => {
    try {
      const res = await ReaderService.addBookmark({ 
        userId: Number(userId), 
        bookId: Number(bookId), 
        pageNumber: Number(currentPage) 
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  const handleDeleteHighlight = async (id) => {
    try {
      await ReaderService.deleteHighlight(id);
      setHighlights(highlights.filter(h => h.id !== id));
    } catch (err) {
      console.error('Failed to delete highlight', err);
    }
  };

  const handleAddHighlight = async () => {
    try {
      // Get selected text from the page
      const selectedText = window.getSelection().toString().trim();

      if (!selectedText) {
        alert('Please select text first before highlighting!');
        return;
      }

      const res = await ReaderService.addHighlight({
        userId: Number(userId),
        bookId: Number(bookId),
        pageNumber: Number(currentPage),
        content: selectedText,
        color: 'yellow'
      });

      if (res.data) {
        setHighlights([...highlights, res.data]);
        alert('Text highlighted successfully!');
        window.getSelection().removeAllRanges(); // Clear selection
      }
    } catch (err) {
      console.error('Failed to add highlight', err);
      alert('Failed to save highlight. Check browser console for details.');
<<<<<<< HEAD
=======
=======
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
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
    }
  };

  const isCompleted = currentPage >= totalPages;
  const themeClass = theme === 'light' ? styles['theme-light'] : theme === 'sepia' ? styles['theme-sepia'] : '';

  return (
    <div className={`${styles['reading-container']} ${focusMode ? styles.focused : ''} ${themeClass}`}>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
  const isCompleted = currentPage >= totalPages;

  return (
    <div className={`${styles['reading-container']} ${focusMode ? styles.focused : ''}`}>
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      {loading ? (
        <div className={styles['reading-loading']}>Loading book content...</div>
      ) : error ? (
        <div className={styles['reading-error']}>{error}</div>
      ) : (
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
        <div className={styles['reading-main-layout']}>

          {/* Left Sidebar (Highlights) */}
          <div className={styles['reading-sidebar-left']}>
            <div className={styles['sidebar-panel']} style={{ flex: 1, justifyContent: 'flex-start' }}>
              <div className={styles['bookmarks-header']}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Highlighter size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>My Highlights</span>
                  </div>
                  <span className={styles['sidebar-setting-subtitle']}>Saved text snippets</span>
                </div>
              </div>

              <div className={styles['bookmark-list']} style={{ marginTop: 12 }}>
                {highlights.length === 0 ? (
                  <div className={styles['empty-state']}>No highlights yet. Select text in the book and click 'Highlight'.</div>
                ) : (
                  highlights.map(hl => (
                    <div key={hl.id} className={styles['bookmark-item']} onClick={() => handleGoToPage(hl.pageNumber)} style={{ alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span className={styles['bookmark-page']} style={{ fontStyle: 'italic', marginBottom: 6, fontSize: '0.85rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                          "{hl.content.length > 80 ? hl.content.substring(0, 80) + '...' : hl.content}"
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={styles['bookmark-date']}>Page {hl.pageNumber} • {new Date(hl.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className={styles['bookmark-delete']} style={{ alignSelf: 'center', marginLeft: 8 }} onClick={(e) => { e.stopPropagation(); handleDeleteHighlight(hl.id); }} title="Remove highlight">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={styles['reading-content-wrapper']}>

<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
        <div className={styles['reading-main-layout']}>
          {/* Main Content Area */}
          <div className={styles['reading-content-wrapper']}>
            
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
            {/* Header */}
            <div className={styles['reading-header']}>
              <button onClick={() => navigate(-1)} className={styles['reading-back-button']}>
                <ArrowLeft size={16} /> Back
              </button>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={styles['reading-back-button']}
                style={{ marginLeft: 12 }}
                title="Open Settings & Bookmarks"
              >
                <Menu size={16} /> Menu
              </button>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={styles['reading-back-button']}
<<<<<<< HEAD
=======
=======
              <button 
                onClick={() => setFocusMode(!focusMode)} 
                className={styles['reading-back-button']} 
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                      <Clock size={14} /> {Math.floor(elapsed / 60)}m {elapsed % 60}s
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-main)' }}>Pages: {pagesReadDuringSession}</div>
<<<<<<< HEAD
=======
=======
                    <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color:'var(--text-main)' }}>
                      <Clock size={14} /> {Math.floor(elapsed / 60)}m {elapsed % 60}s
                    </div>
                    <div className="text-sm" style={{color:'var(--text-main)'}}>Pages: {pagesReadDuringSession}</div>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <button onClick={stopSession} className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">Stop Session</button>
                  </div>
                )}
              </div>
            </div>



            {/* Reading Content */}
            <div className={styles['reading-content-area']}>
              {pdfDoc ? (
                <div className={styles['reading-pdf-container']}>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                  <canvas
                    ref={canvasRef}
                    className={styles['reading-pdf-canvas']}
                    style={{ filter: `brightness(${brightness}%) ${highContrast ? 'contrast(120%) saturate(150%)' : ''}` }}
                  />
                  <div
                    ref={textLayerRef}
                    className={styles['reading-text-layer']}
                  />
<<<<<<< HEAD
=======
=======
                  <canvas 
                    ref={canvasRef} 
                    className={styles['reading-pdf-canvas']} 
                    style={{ filter: `brightness(${brightness}%) ${highContrast ? 'contrast(120%) saturate(150%)' : ''}` }}
                  />
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD

                <div style={{ display: 'flex', gap: '8px' }}>
=======
<<<<<<< HEAD

                <div style={{ display: 'flex', gap: '8px' }}>
=======
                
                <div style={{display:'flex', gap:'8px'}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5

          {/* Sidebar Overlay */}
          <div
            className={`${styles['sidebar-overlay']} ${isSidebarOpen ? styles['open'] : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Left Sidebar (Settings & Bookmarks) */}
          <div className={`${styles['reading-sidebar']} ${isSidebarOpen ? styles['open'] : ''}`}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Menu</h3>
              <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

<<<<<<< HEAD
=======
=======
          
          {/* Right Sidebar (Settings & Bookmarks) */}
          <div className={styles['reading-sidebar']}>
            
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
            {/* Focus Mode Toggle (Always visible) */}
            <div className={styles['sidebar-panel']} style={{ padding: '12px 20px' }}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <ZoomIn size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Zoom Level</span>
                  </div>
                  <span className={styles['sidebar-setting-value']}>{Math.round(zoom * 100)}%</span>
                </div>
                <span className={styles['sidebar-setting-subtitle']}>Adjust page magnification</span>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                <input
                  type="range" min="0.5" max="3.0" step="0.1" value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles['custom-slider']} style={{ marginTop: 8 }}
<<<<<<< HEAD
=======
=======
                <input 
                  type="range" min="0.5" max="3.0" step="0.1" value={zoom} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className={styles['custom-slider']} style={{marginTop: 8}}
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                />
              </div>
            </div>

            {/* Brightness Panel */}
            <div className={styles['sidebar-panel']}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <Layout size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Page Brightness</span>
                  </div>
                  <span className={styles['sidebar-setting-value']}>{brightness}%</span>
                </div>
                <span className={styles['sidebar-setting-subtitle']}>Adjust reading comfort</span>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                <input
                  type="range" min="50" max="150" step="1" value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className={styles['custom-slider']} style={{ marginTop: 8 }}
<<<<<<< HEAD
=======
=======
                <input 
                  type="range" min="50" max="150" step="1" value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))} 
                  className={styles['custom-slider']} style={{marginTop: 8}}
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                />
              </div>
            </div>

            {/* Theme Panel */}
            <div className={styles['sidebar-panel']}>
              <div className={styles['sidebar-setting-row']}>
                <div className={styles['sidebar-setting-header']}>
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
<<<<<<< HEAD
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
=======
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <Palette size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Theme</span>
                  </div>
                </div>
<<<<<<< HEAD
                <span className={styles['sidebar-setting-subtitle']} style={{ marginBottom: 8 }}>Dark / Sepia / Light</span>
=======
<<<<<<< HEAD
                <span className={styles['sidebar-setting-subtitle']} style={{ marginBottom: 8 }}>Dark / Sepia / Light</span>
=======
                <span className={styles['sidebar-setting-subtitle']} style={{marginBottom: 8}}>Dark / Sepia / Light</span>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                <div className={styles['sidebar-setting-header']} style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Contrast size={16} color="var(--text-muted)" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
<<<<<<< HEAD
=======
=======
                <div className={styles['sidebar-setting-header']} style={{marginBottom: 4}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <Contrast size={16} color="var(--text-muted)" />
                    <div style={{display:'flex', flexDirection:'column'}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
            <div className={styles['sidebar-panel']} style={{ flex: 1, justifyContent: 'flex-start' }}>
              <div className={styles['bookmarks-header']}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<<<<<<< HEAD
=======
=======
            <div className={styles['sidebar-panel']} style={{flex: 1, justifyContent:'flex-start'}}>
              <div className={styles['bookmarks-header']}>
                <div style={{display:'flex', flexDirection:'column'}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <BookmarkIcon size={16} color="var(--text-muted)" />
                    <span className={styles['sidebar-setting-title']}>Bookmarks</span>
                  </div>
                  <span className={styles['sidebar-setting-subtitle']}>Create / Open / Delete</span>
<<<<<<< HEAD
                  <span className={styles['sidebar-setting-subtitle']} style={{ marginTop: 4, color: 'var(--accent-color)' }}>Current Page: {currentPage}</span>
=======
<<<<<<< HEAD
                  <span className={styles['sidebar-setting-subtitle']} style={{ marginTop: 4, color: 'var(--accent-color)' }}>Current Page: {currentPage}</span>
=======
                  <span className={styles['sidebar-setting-subtitle']} style={{marginTop:4, color:'var(--accent-color)'}}>Current Page: {currentPage}</span>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                </div>
                <button className={styles['btn-add']} onClick={handleAddBookmark}>
                  <Plus size={14} /> Add
                </button>
              </div>
<<<<<<< HEAD

              <div className={styles['bookmark-list']} style={{ marginTop: 12 }}>
=======
<<<<<<< HEAD

              <div className={styles['bookmark-list']} style={{ marginTop: 12 }}>
=======
              
              <div className={styles['bookmark-list']} style={{marginTop: 12}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                {bookmarks.length === 0 ? (
                  <div className={styles['empty-state']}>No bookmarks yet.</div>
                ) : (
                  bookmarks.map(bm => (
                    <div key={bm.id} className={styles['bookmark-item']} onClick={() => handleGoToPage(bm.pageNumber)}>
<<<<<<< HEAD
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
=======
<<<<<<< HEAD
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
=======
                      <div style={{display:'flex', flexDirection:'column'}}>
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
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
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      )}
    </div>
  );
};

export default Reading;
