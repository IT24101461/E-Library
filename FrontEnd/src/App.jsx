// App.jsx — Entry point for e-Library React App
// Feature 4 : Bookshelf
// Feature X : Advanced Search & Filtering

import { useState, useEffect, useRef } from 'react';
import Bookshelf from './Bookshelf';
import AdvancedSearch from './AdvancedSearch';
import './Bookshelf.css';

// Shared custom cursor — lives at App level so it works on all pages
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
      trail.className = 'cursor-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top  = `${e.clientY}px`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 700);
    };
    const onEnter = () => { ringRef.current?.classList.add('hovering'); dotRef.current?.classList.add('hovering'); };
    const onLeave = () => { ringRef.current?.classList.remove('hovering'); dotRef.current?.classList.remove('hovering'); };
    const onDown  = () => ringRef.current?.classList.add('clicking');
    const onUp    = () => ringRef.current?.classList.remove('clicking');

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    const attachHover = () => {
      document.querySelectorAll('button, a, .chip, .book-card, .sidebar-item, .card-action-btn')
        .forEach(el => {
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        });
    };
    attachHover();
    // Re-attach after React re-renders
    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

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
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot"  ref={dotRef}  />
    </>
  );
}

export default function App() {
  const [page, setPage] = useState('bookshelf');

  return (
    <div className="App">
      <CustomCursor />
      <div className="noise-overlay" />

      {/* ── Shared Topbar ── */}
      <div className="topbar" style={{ zIndex: 300 }}>
        <div className="topbar-logo">e<span>Library</span></div>
        <nav className="topbar-nav">
          <a
            href="#"
            className={page === 'bookshelf' ? 'active' : ''}
            onClick={e => { e.preventDefault(); setPage('bookshelf'); }}
          >
            📚 Bookshelf
          </a>
          <a
            href="#"
            className={page === 'search' ? 'active' : ''}
            onClick={e => { e.preventDefault(); setPage('search'); }}
          >
            🔍 Advanced Search
          </a>
        </nav>
        <div className="topbar-user">U</div>
      </div>

      {/* ── Pages ── */}
      {page === 'bookshelf' && <Bookshelf hideTopbar />}
      {page === 'search'    && <AdvancedSearch />}
    </div>
  );
}
