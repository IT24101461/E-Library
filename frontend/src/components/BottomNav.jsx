import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Sparkles, Bookmark, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const location = useLocation();

  // Paths where we don't want to show the bottom nav (e.g., login, register, reading mode)
  const hidePaths = ['/login', '/register', '/admin-login', '/admin-register', '/start', '/'];
  const isReader = location.pathname.includes('/reading/');
  
  if (hidePaths.includes(location.pathname) || isReader) {
    return null;
  }

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        <NavLink 
          to="/activity" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={24} />
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/books" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Book size={24} />
          <span>Library</span>
        </NavLink>

        <NavLink 
          to="/search" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.searchFab}>
            <Sparkles size={28} />
          </div>
          <span className={styles.fabLabel}>Hub</span>
        </NavLink>

        <NavLink 
          to="/bookshelf" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Bookmark size={24} />
          <span>Shelf</span>
        </NavLink>

        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <User size={24} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
