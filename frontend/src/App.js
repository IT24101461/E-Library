import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ActivityDashboard from './pages/ActivityDashboard';
import UserDashboard from './pages/UserDashboard';
import BooksPage from './pages/BooksPage';
import Reading from './pages/Reading';
import AddBook from './pages/AddBook';
import Login from './pages/Login';
import Register from './pages/Register';
import StartPage from './pages/StartPage';
import FeedbackPage from './pages/FeedbackPage';
import Bookshelf from './pages/Bookshelf';
import SearchHub from './pages/SearchHub';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminRoute from './components/AdminRoute';
import BottomNav from './components/BottomNav';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppRoutes() {
  const location = useLocation();
  const { theme } = useTheme();
  const hideHeaderPaths = ['/', '/start', '/admin-dashboard', '/admin-login', '/admin-register', '/login', '/register'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  // Scroll to hash fragment on navigation (handles links like /dashboard#recommendations)
  useEffect(() => {
    const hash = location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = hash.replace('#', '');
    const scrollToElement = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // Try immediate scroll; if element not mounted yet, retry shortly
    scrollToElement();
    const retry = setTimeout(scrollToElement, 200);
    return () => clearTimeout(retry);
  }, [location]);

  return (
    <div className={`min-h-screen bg-transparent transition-colors duration-500 ${theme}`}>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/activity" element={<ActivityDashboard />} />
        <Route path="/history" element={<ActivityDashboard />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        <Route path="/search" element={<SearchHub />} />
        
        {/* Admin Routes - Separate from User Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
