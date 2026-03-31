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
import FeedbackPage from './pages/FeedbackPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminRoute from './components/AdminRoute';
import Bookshelf from './pages/Bookshelf';
import BookRankerApp from './pages/BookRankerApp';
import BookList from './pages/BookList';
import UploadBook from './pages/UploadBook';
import Reader from './pages/Reader';
import EditBook from './pages/EditBook';
import History from './pages/History';
import './App.css';

// Passes onNavigate to Bookshelf so "Explore Book Ranker" button works
function BookshelfWithNav() {
  const navigate = useNavigate();
  return <Bookshelf onNavigate={(page) => navigate(`/${page}`)} />;
}

// Passes onNavigate to BookRankerApp so "← Back to Bookshelf" button works
function BookRankerWithNav() {
  const navigate = useNavigate();
  return <BookRankerApp onNavigate={(page) => navigate(`/${page}`)} />;
}

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
        <Route path="/"                element={<StartPage />} />
        <Route path="/start"           element={<StartPage />} />
        <Route path="/dashboard"       element={<ActivityDashboard />} />
        <Route path="/history"         element={<History />} />
        <Route path="/books"           element={<BooksPage />} />
        <Route path="/books/add"       element={<AddBook />} />
        <Route path="/add-book"        element={<AddBook />} />
        <Route path="/feedback"        element={<FeedbackPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/reading/:bookId" element={<Reading />} />
        <Route path="/bookshelf"       element={<BookshelfWithNav />} />
        <Route path="/ranker"          element={<BookRankerWithNav />} />

        {/* Teammate's routes */}
        <Route path="/book-list"       element={<BookList />} />
        <Route path="/upload"          element={<UploadBook />} />
        <Route path="/read/:id"        element={<Reader />} />
        <Route path="/edit/:id"        element={<EditBook />} />

        {/* Admin Routes */}
        <Route path="/admin-login"     element={<AdminLogin />} />
        <Route path="/admin-register"  element={<AdminRegister />} />
        <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/edit/:id"  element={<AdminRoute><EditBook /></AdminRoute>} />
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