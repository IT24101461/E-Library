import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BookList from "./pages/BookList";
import UploadBook from "./pages/UploadBook";
import Reader from "./pages/Reader";
import AdminDashboard from "./pages/AdminDashboard";
import EditBook from "./pages/EditBook";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/upload" element={<UploadBook />} />
        <Route path="/read/:id" element={<Reader />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edit/:id" element={<EditBook />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;