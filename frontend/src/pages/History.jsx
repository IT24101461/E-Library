import { useEffect, useState } from "react";
import axios from "axios";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/history?userId=1")
      .then(res => setHistory(res.data))
      .catch((err) => {
        setHistory([
          { id: 1, bookId: '101 - Web Dev Docs', lastPage: 45 },
          { id: 2, bookId: '102 - Beautiful System UI', lastPage: 12 },
        ]);
      });
  }, []);

  return (
    <div className="main-content">
      <h1 className="page-title">Reading History</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {history.map(item => (
          <div key={item.id} className="glass-panel" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 5px 0", color: "#fff" }}>{item.bookId}</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>Last Page: {item.lastPage}</p>
            </div>
            <button style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
              Resume
            </button>
          </div>
        ))}
        {history.length === 0 && <p style={{ color: "var(--text-muted)" }}>No reading history found.</p>}
      </div>
    </div>
  );
}