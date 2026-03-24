import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000";

// ─── Injected Global Styles (mirrors Bookshelf.css exactly) ──────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg-primary:    #0f0f0f;
    --bg-secondary:  #161616;
    --bg-card:       #1c1c1e;
    --bg-hover:      #242428;
    --accent:        #00e5ff;
    --accent-dim:    rgba(0, 229, 255, 0.12);
    --accent-glow:   rgba(0, 229, 255, 0.35);
    --accent-soft:   rgba(0, 229, 255, 0.06);
    --text-primary:  #f0f0f0;
    --text-secondary:#8a8a9a;
    --text-dim:      #4a4a5a;
    --border:        rgba(255,255,255,0.06);
    --border-hover:  rgba(0,229,255,0.3);
    --gold:          #ffc947;
    --gold-dim:      rgba(255,201,71,0.15);
    --danger:        #ff4d6d;
    --radius:        10px;
    --radius-lg:     16px;
    --transition:    0.22s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Cursor ── */
  *, *::before, *::after { cursor: none !important; }

  .br-ring {
    position:fixed; width:36px; height:36px;
    border:1.5px solid var(--accent); border-radius:50%;
    pointer-events:none; z-index:99999;
    transform:translate(-50%,-50%);
    transition:width .2s ease,height .2s ease,border-color .2s ease,background .2s ease;
  }
  .br-dot {
    position:fixed; width:6px; height:6px;
    background:var(--accent); border-radius:50%;
    pointer-events:none; z-index:99999;
    transform:translate(-50%,-50%);
    box-shadow:0 0 8px var(--accent-glow);
    transition:width .1s ease,height .1s ease;
  }
  .br-trail {
    position:fixed; width:5px; height:5px;
    border-radius:50%; background:var(--accent);
    pointer-events:none; z-index:99998;
    opacity:0; transform:translate(-50%,-50%);
    animation:brTrail .7s ease forwards;
  }
  @keyframes brTrail {
    0%   { opacity:0.5; transform:translate(-50%,-50%) scale(1); }
    100% { opacity:0;   transform:translate(-50%,-50%) scale(0.1); }
  }
  .br-ring.hovering { width:50px; height:50px; border-color:var(--gold); background:rgba(255,201,71,0.05); }
  .br-dot.hovering  { background:var(--gold); box-shadow:0 0 10px rgba(255,201,71,0.6); }
  .br-ring.clicking { width:24px; height:24px; background:var(--accent-dim); }

  /* ── Animated grid background ── */
  .br-bg::before {
    content:''; position:fixed; inset:0;
    background-image:
      linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),
      linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px);
    background-size:64px 64px;
    pointer-events:none; z-index:0;
    animation:brGridDrift 24s linear infinite;
  }
  @keyframes brGridDrift {
    0%   { background-position:0 0; }
    100% { background-position:64px 64px; }
  }

  /* ── Ambient glow orb ── */
  .br-bg::after {
    content:''; position:fixed;
    width:700px; height:700px; border-radius:50%;
    background:radial-gradient(circle,rgba(0,229,255,0.05) 0%,transparent 65%);
    top:-250px; right:-150px;
    pointer-events:none; z-index:0;
    animation:brOrb 10s ease-in-out infinite alternate;
  }
  @keyframes brOrb {
    0%   { transform:translate(0,0) scale(1); }
    100% { transform:translate(-50px,80px) scale(1.15); }
  }

  /* ── Noise overlay ── */
  .br-noise {
    position:fixed; inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events:none; z-index:1; opacity:0.4;
  }

  /* ── Topbar shimmer scan ── */
  .br-topbar::after {
    content:''; position:absolute;
    bottom:0; left:-60%; width:60%; height:1px;
    background:linear-gradient(90deg,transparent,var(--accent),transparent);
    animation:brScan 5s ease-in-out infinite; opacity:0.5;
  }
  @keyframes brScan { 0%{left:-60%} 100%{left:140%} }

  /* ── Animations ── */
  @keyframes brFadeSlide { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes brFadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes brCardIn    { from{opacity:0;transform:translateY(20px) scale(.94)} to{opacity:1;transform:translateY(0) scale(1)} }

  /* ── Search input focus glow ── */
  .br-search:focus {
    border-color: var(--border-hover) !important;
    box-shadow: 0 0 0 3px var(--accent-dim), 0 0 20px rgba(0,229,255,0.06) !important;
  }
  .br-search::placeholder { color: var(--text-dim); }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar       { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(0,229,255,.2); border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(0,229,255,.4); }

  /* ── Chip ── */
  .br-chip {
    padding:6px 16px; border-radius:20px; font-size:12px; font-weight:500;
    border:1px solid var(--border); background:var(--bg-secondary); color:var(--text-secondary);
    transition:all var(--transition); font-family:'DM Sans',sans-serif;
    position:relative; overflow:hidden;
  }
  .br-chip::before { content:''; position:absolute; inset:0; background:var(--accent-dim); border-radius:20px; opacity:0; transition:opacity var(--transition); }
  .br-chip:hover::before { opacity:1; }
  .br-chip:hover { border-color:rgba(255,255,255,.15); color:var(--text-primary); }
  .br-chip.active { background:var(--accent-dim); border-color:var(--border-hover); color:var(--accent); box-shadow:0 0 12px var(--accent-dim); }

  /* ── Book row card ── */
  .br-book-row {
    display:flex; gap:14px; padding:14px 16px;
    border-left:3px solid var(--border);
    border-radius:var(--radius);
    background:var(--bg-secondary);
    border-top:1px solid var(--border);
    border-right:1px solid var(--border);
    border-bottom:1px solid var(--border);
    transition:transform .15s ease, box-shadow .15s ease;
    animation:brCardIn .4s ease both;
    position:relative; overflow:hidden;
  }
  .br-book-row::before {
    content:''; position:absolute; left:-100%; top:0;
    width:100%; height:100%;
    background:linear-gradient(90deg,var(--accent-dim),transparent);
    transition:left .3s ease;
  }
  .br-book-row:hover::before { left:0; }
  .br-book-row:hover {
    transform:translateX(5px);
    box-shadow:0 4px 20px rgba(0,0,0,.4), 0 0 0 1px rgba(0,229,255,.08);
  }
  .br-book-row.gold  { border-left-color:#f59e0b; }
  .br-book-row.silver{ border-left-color:#94a3b8; }
  .br-book-row.bronze{ border-left-color:#b45309; }

  /* ── Tab button ── */
  .br-tab {
    padding:8px 22px; border-radius:8px; border:1px solid var(--border);
    font-weight:700; font-size:13px; font-family:'Syne',sans-serif;
    transition:all var(--transition); background:var(--bg-secondary); color:var(--text-secondary);
  }
  .br-tab.active { background:var(--accent); color:#000; border-color:var(--accent); box-shadow:0 0 18px var(--accent-glow); }
  .br-tab:not(.active):hover { border-color:var(--border-hover); color:var(--text-primary); }

  /* ── Send button ── */
  .br-send {
    padding:12px 26px; background:var(--accent); border:none; border-radius:var(--radius);
    color:#000; font-weight:700; font-size:13px; font-family:'Syne',sans-serif;
    transition:all var(--transition); position:relative; overflow:hidden;
  }
  .br-send::before {
    content:''; position:absolute; top:0; left:-100%;
    width:100%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .4s ease;
  }
  .br-send:hover::before { left:100%; }
  .br-send:hover { transform:translateY(-2px); box-shadow:0 8px 24px var(--accent-glow); }

  /* ── Search button ── */
  .br-search-btn {
    padding:11px 22px; background:var(--accent); border:none; border-radius:var(--radius);
    color:#000; font-weight:700; font-size:13px; font-family:'Syne',sans-serif;
    transition:all var(--transition);
  }
  .br-search-btn:hover { opacity:.85; transform:translateY(-1px); box-shadow:0 6px 18px var(--accent-glow); }

  /* ── Nav buttons ── */
  .br-nav-btn {
    padding:8px 20px; border-radius:8px; border:1px solid var(--border);
    font-weight:600; font-size:13px; font-family:'Syne',sans-serif;
    background:var(--bg-secondary); color:var(--text-secondary);
    transition:all var(--transition);
  }
  .br-nav-btn.active { background:var(--accent-dim); color:var(--accent); border-color:var(--border-hover); }
  .br-nav-btn:not(.active):hover { border-color:var(--border-hover); color:var(--text-primary); }

  @media (hover:none) {
    .br-ring,.br-dot { display:none; }
    *,*::before,*::after { cursor:auto !important; }
  }
`;

// ─── Custom Cursor ────────────────────────────────────────────────────────
function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef  = useRef(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const rafId   = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = GLOBAL_STYLES;
    document.head.appendChild(styleEl);

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }
      const t = document.createElement("div");
      t.className = "br-trail";
      t.style.left = `${e.clientX}px`;
      t.style.top  = `${e.clientY}px`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 700);
    };

    const onEnter = () => { ringRef.current?.classList.add("hovering"); dotRef.current?.classList.add("hovering"); };
    const onLeave = () => { ringRef.current?.classList.remove("hovering"); dotRef.current?.classList.remove("hovering"); };
    const onDown  = () => ringRef.current?.classList.add("clicking");
    const onUp    = () => ringRef.current?.classList.remove("clicking");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    document.querySelectorAll("button,a,input").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top  = `${ring.current.y}px`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(rafId.current);
      styleEl.remove();
    };
  }, []);

  return (
    <>
      <div className="br-ring" ref={ringRef} />
      <div className="br-dot"  ref={dotRef}  />
    </>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────
const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "var(--gold)", fontSize: "13px", letterSpacing: "2px", textShadow: "0 0 8px rgba(255,201,71,.5)" }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: "var(--text-dim)", marginLeft: 6, fontSize: "12px", letterSpacing: 0 }}>{rating.toFixed(2)}</span>
    </span>
  );
};

// ─── Book Row ─────────────────────────────────────────────────────────────
const BookRow = ({ book, index }) => {
  const cls = index === 0 ? "br-book-row gold" : index === 1 ? "br-book-row silver" : index === 2 ? "br-book-row bronze" : "br-book-row";
  return (
    <div className={cls} style={{ animationDelay: `${index * 0.04}s` }}>
      {book.image_url && (
        <img src={book.image_url} alt={book.title}
          style={{ width: 46, height: 66, objectFit: "cover", borderRadius: 6, flexShrink: 0, boxShadow: "4px 4px 12px rgba(0,0,0,.6)" }} />
      )}
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          {index < 3 && (
            <span style={{
              background: index === 0 ? "var(--gold)" : index === 1 ? "#94a3b8" : "#b45309",
              color: "#000", fontSize: "10px", fontWeight: 800,
              padding: "2px 7px", borderRadius: 4, fontFamily: "'Syne', sans-serif",
              letterSpacing: ".04em"
            }}>#{index + 1}</span>
          )}
          <span style={{
            color: "var(--text-primary)", fontWeight: 700, fontSize: "14px",
            fontFamily: "'Syne', sans-serif",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>{book.title}</span>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: 5 }}>
          {book.authors}{book.publication_year ? ` · ${book.publication_year}` : ""}
        </div>
        <StarRating rating={book.average_rating} />
        {book.description && (
          <div style={{
            color: "var(--text-dim)", fontSize: "11px", marginTop: 5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5
          }}>{book.description}</div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", flexShrink: 0, gap: 6, position: "relative", zIndex: 1 }}>
        <div style={{
          background: "var(--accent-dim)", color: "var(--accent)",
          fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: 12,
          fontFamily: "'Syne', sans-serif", border: "1px solid var(--border-hover)",
          boxShadow: "0 0 10px var(--accent-dim)"
        }}>
          {book.score?.toFixed(3)}
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: "10px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>score</div>
      </div>
    </div>
  );
};

// ─── Chat Message ─────────────────────────────────────────────────────────
const ChatMessage = ({ msg }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
    marginBottom: 14,
  }}>
    <div style={{
      background: msg.role === "user" ? "linear-gradient(135deg,#1d4ed8,#7c3aed)" : "var(--bg-card)",
      color: "var(--text-primary)", fontSize: "13px", padding: "10px 16px",
      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      maxWidth: "82%", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
      border: msg.role === "user" ? "none" : "1px solid var(--border)",
      boxShadow: msg.role === "user" ? "0 4px 16px rgba(29,78,216,.3)" : "none",
    }}>
      {msg.text}
    </div>
    {msg.books && msg.books.length > 0 && (
      <div style={{ marginTop: 10, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        {msg.books.map((b, i) => <BookRow key={b.book_id} book={b} index={i} />)}
      </div>
    )}
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────
export default function BookRankerApp() {
  const [tab, setTab] = useState("ranked");
  const [rankedBooks, setRankedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "👋 Hi! I'm your Book Assistant. Tell me what kind of book you're looking for — genre, mood, author, or just say 'top books'!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/books/ranked?limit=20`)
      .then(r => r.json())
      .then(d => setRankedBooks(d.books || []))
      .catch(() => setRankedBooks([]));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/books/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.books || []);
    } catch { setSearchResults([]); }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    try {
      const res = await fetch(`${API}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "bot", text: data.reply, books: data.books }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "bot", text: "⚠️ Could not connect to the server. Make sure the Python API is running on port 8000." }]);
    }
  };

  const displayBooks = searchResults !== null ? searchResults : rankedBooks;
  const chips = ["Top books", "Fantasy", "Thriller", "Romance", "Classic", "Sci-fi", "Horror"];

  return (
    <div className="br-bg" style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      fontFamily: "'DM Sans', sans-serif",
      color: "var(--text-primary)",
    }}>
      <CustomCursor />
      <div className="br-noise" />

      {/* ── Topbar ── */}
      <div className="br-topbar" style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(15,15,15,0.88)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "brFadeIn .5s ease both",
        position: "relative",
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-.5px" }}>
          e<span style={{ color: "var(--accent)", textShadow: "0 0 20px var(--accent-glow)" }}>Library</span>
          <span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: 13, marginLeft: 12, letterSpacing: ".04em" }}>/ Book Ranker</span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["ranked", "chat"].map(t => (
            <button key={t} className={`br-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t === "ranked" ? "🏆 Rankings" : "💬 Chatbot"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 2 }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 28, animation: "brFadeSlide .5s ease .1s both" }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800,
            color: "var(--text-primary)", letterSpacing: "-.5px",
            borderBottom: "2px solid var(--accent)",
            display: "inline-block", paddingBottom: 6,
            boxShadow: "0 2px 14px var(--accent-glow)",
          }}>
            {tab === "ranked" ? "📚 Book Rankings" : "💬 Book Assistant"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8 }}>
            {tab === "ranked"
              ? `Powered by Weighted Scoring Algorithm · ${rankedBooks.length} books loaded`
              : "Ask me anything — genre, mood, author, or just say 'top books'"}
          </p>
        </div>

        {/* ── RANKED TAB ── */}
        {tab === "ranked" && (
          <div style={{ animation: "brFadeSlide .4s ease both" }}>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{
                  position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-dim)", fontSize: 14, pointerEvents: "none"
                }}>🔍</span>
                <input
                  className="br-search"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setSearchResults(null); }}
                  placeholder="Search by title, author, or keyword..."
                  style={{
                    width: "100%", padding: "11px 16px 11px 38px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius)",
                    color: "var(--text-primary)", fontSize: 14, outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color var(--transition), box-shadow var(--transition)",
                  }}
                />
              </div>
              <button type="submit" disabled={loading} className="br-search-btn">
                {loading ? "..." : "Search"}
              </button>
              {searchResults !== null && (
                <button type="button" onClick={() => { setSearchResults(null); setSearchQuery(""); }} style={{
                  padding: "11px 16px", background: "var(--bg-secondary)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  color: "var(--text-secondary)", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  transition: "all var(--transition)",
                }}>✕ Clear</button>
              )}
            </form>

            {/* Result label */}
            <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 16, letterSpacing: ".04em", textTransform: "uppercase", fontWeight: 600 }}>
              {searchResults !== null
                ? `${searchResults.length} results for "${searchQuery}"`
                : "Top 20 by ranking score"}
            </div>

            {/* Book list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayBooks.length === 0
                ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)", animation: "brFadeIn .5s ease both" }}>
                    <span style={{ fontSize: 52, display: "block", marginBottom: 16, opacity: .35 }}>📭</span>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>No books found</div>
                    <div style={{ fontSize: 13 }}>Try a different search term</div>
                  </div>
                )
                : displayBooks.map((b, i) => <BookRow key={b.book_id} book={b} index={i} />)
              }
            </div>
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", maxHeight: 660, animation: "brFadeSlide .4s ease both" }}>

            {/* Suggestion chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {chips.map(chip => (
                <button key={chip} className="br-chip" onClick={() => setChatInput(chip)}>
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: 16,
              background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)", marginBottom: 12,
            }}>
              {chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
              <div ref={chatEndRef} />
            </div>

            {/* Input row */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  className="br-search"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleChat()}
                  placeholder="Ask me about books..."
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius)",
                    color: "var(--text-primary)", fontSize: 14, outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color var(--transition), box-shadow var(--transition)",
                  }}
                />
              </div>
              <button onClick={handleChat} className="br-send">Send →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}