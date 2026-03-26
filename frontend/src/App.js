import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import ActivityDashboard from './pages/ActivityDashboard';
import BooksPage from './pages/BooksPage';
import Reading from './pages/Reading';
import AddBook from './pages/AddBook';
import Login from './pages/Login';
import Register from './pages/Register';
import StartPage from './pages/StartPage';
import Bookshelf from './Bookshelf';
import BookRankerApp from './BookRankerApp';
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

function AppRoutes() {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/start'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

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

    scrollToElement();
    const retry = setTimeout(scrollToElement, 200);
    return () => clearTimeout(retry);
  }, [location]);

  return (
    <div className="min-h-screen bg-transparent">
      {showHeader && <Header />}
      <Routes>
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