// App.jsx — Entry point for e-Library React App
// Feature 4: Bookshelf (existing)
// Feature 5: Book Ranker + Chatbot (AI/ML)

import { useState } from "react";
import Bookshelf from './Bookshelf';
import BookRankerApp from './BookRankerApp';

function App() {
  const [activePage, setActivePage] = useState("bookshelf");

  return (
    <div className="App">
      {/* Navigation */}
      <nav style={{
        display: "flex",
        gap: "12px",
        padding: "12px 24px",
        background: "#0f172a",
        borderBottom: "1px solid #1e3a5f",
      }}>
        <button
          onClick={() => setActivePage("bookshelf")}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            background: activePage === "bookshelf" ? "#1d4ed8" : "#1e293b",
            color: activePage === "bookshelf" ? "#fff" : "#94a3b8",
          }}
        >
          📖 Bookshelf
        </button>

        <button
          onClick={() => setActivePage("ranker")}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            background: activePage === "ranker" ? "#1d4ed8" : "#1e293b",
            color: activePage === "ranker" ? "#fff" : "#94a3b8",
          }}
        >
          🏆 Book Ranker & Chat
        </button>
      </nav>

      {/* Pages */}
      {activePage === "bookshelf" && <Bookshelf />}
      {activePage === "ranker" && <BookRankerApp />}
    </div>
  );
}

export default App;