import { BrowserRouter, Routes, Route } from "react-router-dom";

// Your team's existing pages
import StartPage from "./pages/StartPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BooksPage from "./pages/BooksPage";
import Bookshelf from "./pages/Bookshelf";
import BookRankerApp from "./pages/BookRankerApp";
import ActivityDashboard from "./pages/ActivityDashboard";
import Reading from "./pages/Reading";
import AddBook from "./pages/AddBook";

// Teammate's new pages
import BookList from "./pages/BookList";
import UploadBook from "./pages/UploadBook";
import Reader from "./pages/Reader";
import AdminDashboard from "./pages/AdminDashboard";
import EditBook from "./pages/EditBook";
import History from "./pages/History";

// Your main Header
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Your team's routes */}
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/ranker" element={<BookRankerApp />} />
        <Route path="/dashboard" element={<ActivityDashboard />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/add-book" element={<AddBook />} />

        {/* Teammate's routes */}
        <Route path="/book-list" element={<BookList />} />
        <Route path="/upload" element={<UploadBook />} />
        <Route path="/read/:id" element={<Reader />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edit/:id" element={<EditBook />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;