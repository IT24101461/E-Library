import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditBook() {
  const { id } = useParams();
  const [form, setForm] = useState({ title: "", author: "", description: "", fileUrl: "" });
  const [file, setFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/books/${id}`);
        setForm({
          title: res.data.title || "",
          author: res.data.author || "",
          description: res.data.description || "",
          fileUrl: res.data.fileUrl || ""
        });
      } catch (err) {
        console.error("Failed to fetch book data", err);
        alert("Failed to load book data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("author", form.author);
      data.append("description", form.description);
      if (file) {
        data.append("file", file);
      }

      await axios.put(`http://localhost:8080/api/books/${id}`, data);
      alert("✨ Book updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Database error: Could not update the book in the backend.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="main-content"><h1 className="page-title">Loading...</h1></div>;

  return (
    <div className="main-content">
      <h1 className="page-title">Edit Book</h1>
      <div className="glass-panel" style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Book Title</label>
            <input value={form.title} placeholder="Enter the title" onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Author Name</label>
            <input value={form.author} placeholder="Who wrote this?" onChange={e => setForm({ ...form, author: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Description</label>
            <textarea value={form.description} placeholder="Describe the contents..." rows="4" onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {form.fileUrl && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Current PDF File</label>
              <div style={{ 
                padding: "12px", 
                backgroundColor: "rgba(255,255,255,0.05)", 
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px"
              }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-main)", wordBreak: "break-all" }}>
                  {form.fileUrl.replace(/^\d+_/, '')}
                </span>
                <a 
                  href={`http://localhost:8080/api/books/${id}/file`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)", fontSize: "0.9rem", textDecoration: "none", fontWeight: "bold", marginLeft: "15px" }}
                >
                  View PDF
                </a>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Upload New PDF File (Optional)</label>
            <input type="file" accept=".pdf" style={{
              padding: "10px",
              backgroundColor: "rgba(0,0,0,0.2)",
              cursor: "pointer",
              border: "1px dashed var(--primary)",
              width: "100%",
              boxSizing: "border-box"
            }} onChange={e => setFile(e.target.files[0])} />
          </div>

          <button type="submit" disabled={isUpdating} style={{ marginTop: "10px", opacity: isUpdating ? 0.7 : 1 }}>
            {isUpdating ? "Updating..." : "Update Book"}
          </button>
        </form>
      </div>
    </div>
  );
}
