import { Link } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>⚡ E-Library</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Books</Link>
        <Link to="/upload" className="nav-link">Upload</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </div>
    </nav>
  );
}