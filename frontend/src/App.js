import React, { useEffect } from 'react';
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
=======
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
import Header from './components/Header';
import ActivityDashboard from './pages/ActivityDashboard';
import BooksPage from './pages/BooksPage';
import Reading from './pages/Reading';
import AddBook from './pages/AddBook';
import Login from './pages/Login';
import Register from './pages/Register';
import StartPage from './pages/StartPage';
<<<<<<< HEAD
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminRoute from './components/AdminRoute';
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
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
    scrollToElement();
    const retry = setTimeout(scrollToElement, 200);
    return () => clearTimeout(retry);
  }, [location]);

  return (
    <div className="min-h-screen bg-transparent">
      {showHeader && <Header />}
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<StartPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/dashboard" element={<ActivityDashboard />} />
        <Route path="/history" element={<ActivityDashboard />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        
        {/* Admin Routes - Separate from User Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
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
export default App;
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
