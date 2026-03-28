import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/books");
      if (res.data && Array.isArray(res.data)) {
        setBooks(res.data);
      }
    } catch (err) {
      console.log("Backend unavailable:", err.message);
      setBooks([]);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:8080/api/books/${id}`);
        fetchBooks();
      } catch (err) {
        alert("Failed to delete book.");
        console.error(err);
      }
    }
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Admin Dashboard</h1>
      {books.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1.1rem" }}>No books uploaded yet. Go to <strong>Upload</strong> to add your first book!</p>
        </div>
      ) : (
        <div className="content-grid">
          {books.map(book => (
            <div key={book.id} className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>{book.title}</h2>
                <p style={{ color: "var(--text-muted)", margin: "0 0 1rem 0" }}>by {book.author}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => navigate(`/admin/edit/${book.id}`)}
                  style={{ flex: 1, backgroundColor: "var(--primary)" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  style={{ flex: 1, backgroundColor: "#e74c3c" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
