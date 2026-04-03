import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ActivityDashboard from './pages/ActivityDashboard';
import BooksPage from './pages/BooksPage';
import Reading from './pages/Reading';
import AddBook from './pages/AddBook';
import Login from './pages/Login';
import Register from './pages/Register';
import StartPage from './pages/StartPage';
import FeedbackPage from './pages/FeedbackPage';
import Bookshelf from './pages/Bookshelf';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/start', '/admin-dashboard', '/admin-login', '/admin-register'];
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
    <div className="min-h-screen bg-transparent">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/dashboard" element={<ActivityDashboard />} />
        <Route path="/history" element={<ActivityDashboard />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        
        {/* Admin Routes - Separate from User Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
