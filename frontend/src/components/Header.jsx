import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const isActive = (path) => location.pathname === path ? styles.navLinkActive : '';

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoBadge}>
              <img src="/images/logo.svg" alt="E-Library" className={styles.logoImage} />
            </div>
          </Link>
          <div>
            <h1 className={styles.logoTitle}>E-Library</h1>
            <p className={styles.logoSubtitle}>Digital Reading</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className={styles.navDesktop}>
          <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard')}`}>🏠 Dashboard</Link>
          <Link to="/books" className={`${styles.navLink} ${isActive('/books')}`}>📖 Books</Link>
          <Link to="/bookshelf" className={`${styles.navLink} ${isActive('/bookshelf')}`}>🗂 Bookshelf</Link>
          <Link to="/book-list" className={`${styles.navLink} ${isActive('/book-list')}`}>📋 Book List</Link>
          <Link to="/history" className={`${styles.navLink} ${isActive('/history')}`}>🕓 History</Link>
          <Link to="/ranker" className={`${styles.navLink} ${isActive('/ranker')}`}>🏆 Ranker</Link>
          <Link to={{ pathname: '/dashboard', hash: '#recommendations' }} className={styles.navLink}>🤖 AI Recs</Link>

          {/* Admin-only links */}
          {user && user.role === 'ADMIN' && (
            <>
              <Link to="/upload" className={`${styles.navLink} ${isActive('/upload')}`}>⬆️ Upload</Link>
              <Link to="/admin" className={`${styles.navLink} ${isActive('/admin')}`}>⚙️ Admin</Link>
              <Link to="/add-book" className={`${styles.navLink} ${isActive('/add-book')}`}>➕ Add Book</Link>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className={styles.userMenu}>
          {user ? (
            <>
              <button onClick={() => navigate('/dashboard')} className={styles.userButton}>{user.fullName}</button>

              {/* Dev-only helper: promote current session user to ADMIN (client-side only) */}
              {process.env.NODE_ENV === 'development' && user.role !== 'ADMIN' && (
                <button
                  onClick={() => {
                    try {
                      const raw = localStorage.getItem('authUser');
                      if (!raw) return;
                      const u = JSON.parse(raw);
                      u.role = 'ADMIN';
                      localStorage.setItem('authUser', JSON.stringify(u));
                      setUser(u);
                      alert('Local session promoted to ADMIN (development only)');
                    } catch (e) {
                      console.error('Failed to promote to admin', e);
                    }
                  }}
                  title="Temporarily promote this session to ADMIN (dev only)"
                  className={styles.userButtonSecondary}
                >
                  Promote to Admin
                </button>
              )}

              <button
                onClick={() => { localStorage.removeItem('authUser'); setUser(null); navigate('/login'); }}
                className={styles.userButtonPrimary}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.userButton}>Sign in</Link>
              <Link to="/register" className={styles.userButtonPrimary}>Register</Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.mobileToggle}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link to="/dashboard" className={styles.mobileNavLink}>🏠 Dashboard</Link>
          <Link to="/books" className={styles.mobileNavLink}>📖 Books</Link>
          <Link to="/bookshelf" className={styles.mobileNavLink}>🗂 Bookshelf</Link>
          <Link to="/book-list" className={styles.mobileNavLink}>📋 Book List</Link>
          <Link to="/history" className={styles.mobileNavLink}>🕓 History</Link>
          <Link to="/ranker" className={styles.mobileNavLink}>🏆 Ranker</Link>
          <Link to={{ pathname: '/dashboard', hash: '#recommendations' }} className={styles.mobileNavLink}>🤖 AI Recs</Link>

          {user && user.role === 'ADMIN' && (
            <>
              <Link to="/upload" className={styles.mobileNavLink}>⬆️ Upload</Link>
              <Link to="/admin" className={styles.mobileNavLink}>⚙️ Admin</Link>
              <Link to="/add-book" className={styles.mobileNavLink}>➕ Add Book</Link>
            </>
          )}

          {user ? (
            <button
              onClick={() => { localStorage.removeItem('authUser'); setUser(null); navigate('/login'); }}
              className={styles.mobileNavLink}
            >
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className={styles.mobileNavLink}>Sign in</Link>
              <Link to="/register" className={styles.mobileNavLink}>Register</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;