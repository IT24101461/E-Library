import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear old demo/offline mock books from localStorage
    localStorage.removeItem("mockBooks");

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

    fetchBooks();
  }, []);

  return (
    <div className="main-content">
      <h1 className="page-title">Available Books</h1>
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
              <button
                onClick={() => navigate(`/read/${book.id}`)}
                style={{ alignSelf: "flex-end", width: "100%" }}
              >
                Read Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}