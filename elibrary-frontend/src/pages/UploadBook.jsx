import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadBook() {
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Error: Please select a PDF file before uploading to register in the database.");
      return;
    }

    setIsUploading(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("author", form.author);
      data.append("description", form.description);
      data.append("file", file);

      await axios.post("http://localhost:8080/api/books", data);
      alert("✨ Book saved to the database successfully!");
      navigate("/"); // Ensure we navigate back locally out of upload
    } catch (err) {
      console.error(err);

      // Persist locally ONLY if the database failed so the frontend still has an offline fallback
      let mockedBooks = JSON.parse(localStorage.getItem("mockBooks")) || [];
      const newLocalBook = {
        id: "local-" + Date.now(),
        title: form.title || "Untitled",
        author: form.author || "Unknown"
      };
      mockedBooks.push(newLocalBook);
      localStorage.setItem("mockBooks", JSON.stringify(mockedBooks));

      alert("Database error: Could not save to backend. Falling back to local offline preview.");
      navigate("/"); // Ensure we navigate back
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Upload Required Book</h1>
      <div className="glass-panel" style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Book Title</label>
            <input placeholder="Enter the title" onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Author Name</label>
            <input placeholder="Who wrote this?" onChange={e => setForm({ ...form, author: e.target.value })} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Description</label>
            <textarea placeholder="Describe the contents..." rows="4" onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Upload PDF File</label>
            <input type="file" accept=".pdf" style={{
              padding: "10px",
              backgroundColor: "rgba(0,0,0,0.2)",
              cursor: "pointer",
              border: "1px dashed var(--primary)"
            }} onChange={e => setFile(e.target.files[0])} />
          </div>

          <button type="submit" disabled={isUploading} style={{ marginTop: "10px", opacity: isUploading ? 0.7 : 1 }}>
            {isUploading ? "Uploading..." : "Publish Book"}
          </button>
        </form>
      </div>
    </div>
  );
}