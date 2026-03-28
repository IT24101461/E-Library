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

  const isActive = (path) => (location.pathname === path ? 'active' : '');

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

        <nav className={styles.navDesktop}>
          <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.navLinkActive : ''}`}>
            🏠 Dashboard
          </Link>
          <Link to="/books" className={`${styles.navLink} ${isActive('/books') ? styles.navLinkActive : ''}`}>
            📖 Books
          </Link>
          <Link to={{ pathname: '/dashboard', hash: '#recommendations' }} className={`${styles.navLink}`}>
            🤖 AI Recs
          </Link>
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className={`${styles.navLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}>
              ⚙️ Admin
            </Link>
          )}
        </nav>

        <div className={styles.userMenu}>
          {user ? (
            <>
              <button onClick={() => navigate('/dashboard')} className={styles.userButton}>{user.fullName}</button>
              <button onClick={() => { localStorage.removeItem('authUser'); setUser(null); navigate('/login'); }} className={styles.userButtonPrimary}>Log Out</button>
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

      {mobileMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link to="/dashboard" className={styles.mobileNavLink}>🏠 Dashboard</Link>
          <Link to="/books" className={styles.mobileNavLink}>📖 Books</Link>
          <Link to={{ pathname: '/dashboard', hash: '#recommendations' }} className={styles.mobileNavLink}>🤖 AI Recs</Link>
          {user ? (
            <button onClick={() => { localStorage.removeItem('authUser'); setUser(null); navigate('/login'); }} className={styles.mobileNavLink}>Log Out</button>
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
