import React, { useEffect } from 'react';
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
=======
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
=======
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
=======
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
=======
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
import Header from './components/Header';
import ActivityDashboard from './pages/ActivityDashboard';
import BooksPage from './pages/BooksPage';
import Reading from './pages/Reading';
import AddBook from './pages/AddBook';
import Login from './pages/Login';
import Register from './pages/Register';
import StartPage from './pages/StartPage';
<<<<<<< HEAD
import FeedbackPage from './pages/FeedbackPage';
import Bookshelf from './pages/Bookshelf';
=======
<<<<<<< HEAD
import FeedbackPage from './pages/FeedbackPage';
=======
<<<<<<< HEAD
import FeedbackPage from './pages/FeedbackPage';
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminRoute from './components/AdminRoute';
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11

function AppRoutes() {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/start', '/admin-dashboard', '/admin-login', '/admin-register'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  // Scroll to hash fragment on navigation (handles links like /dashboard#recommendations)
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
=======
import Bookshelf from './pages/Bookshelf';
import BookRankerApp from './pages/BookRankerApp';
import './App.css';

// ✅ FIX 1: Passes onNavigate to Bookshelf so "Explore Book Ranker" button works
function BookshelfWithNav() {
  const navigate = useNavigate();
  return <Bookshelf onNavigate={(page) => navigate(`/${page}`)} />;
}

// ✅ FIX 2: Passes onNavigate to BookRankerApp so "← Back to Bookshelf" button works
function BookRankerWithNav() {
  const navigate = useNavigate();
  return <BookRankerApp onNavigate={(page) => navigate(`/${page}`)} />;
}
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5

function AppRoutes() {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/start'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

<<<<<<< HEAD
  // Scroll to hash fragment on navigation (handles links like /dashboard#recommendations)
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
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

<<<<<<< HEAD
    // Try immediate scroll; if element not mounted yet, retry shortly
=======
<<<<<<< HEAD
    // Try immediate scroll; if element not mounted yet, retry shortly
=======
<<<<<<< HEAD
    // Try immediate scroll; if element not mounted yet, retry shortly
=======
<<<<<<< HEAD
    // Try immediate scroll; if element not mounted yet, retry shortly
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
    scrollToElement();
    const retry = setTimeout(scrollToElement, 200);
    return () => clearTimeout(retry);
  }, [location]);

  return (
    <div className="min-h-screen bg-transparent">
      {showHeader && <Header />}
      <Routes>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        <Route path="/" element={<StartPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/dashboard" element={<ActivityDashboard />} />
        <Route path="/history" element={<ActivityDashboard />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/add" element={<AddBook />} />
<<<<<<< HEAD
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
=======
<<<<<<< HEAD
        <Route path="/feedback" element={<FeedbackPage />} />
=======
<<<<<<< HEAD
        <Route path="/feedback" element={<FeedbackPage />} />
=======
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        
        {/* Admin Routes - Separate from User Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
        <Route path="/"                element={<StartPage />} />
        <Route path="/start"           element={<StartPage />} />
        <Route path="/dashboard"       element={<ActivityDashboard />} />
        <Route path="/history"         element={<ActivityDashboard />} />
        <Route path="/books"           element={<BooksPage />} />
        <Route path="/books/add"       element={<AddBook />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        {/* ✅ FIX: Wrapper components pass onNavigate to both pages */}
        <Route path="/bookshelf"       element={<BookshelfWithNav />} />
        <Route path="/ranker"          element={<BookRankerWithNav />} />
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
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

<<<<<<< HEAD
export default App;
=======
<<<<<<< HEAD
export default App;
=======
<<<<<<< HEAD
export default App;
=======
<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
