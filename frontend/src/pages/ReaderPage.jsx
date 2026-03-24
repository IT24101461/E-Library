import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import AIRecommendations from "../components/AIRecommendations";
import ReadingToolsPanel from "../components/ReadingToolsPanel";
import mockRecommendations from "../data/mockRecommendations";

export default function ReaderPage() {
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [theme, setTheme] = useState("dark");
  const [highContrast, setHighContrast] = useState(false);

  const [selectedVibes, setSelectedVibes] = useState([]);
  const [vibeInput, setVibeInput] = useState("");

  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const vibeOptions = [
    "dark",
    "cozy",
    "emotional",
    "futuristic",
    "magical",
    "deep",
    "fast-paced",
    "adventure",
    "romantic",
    "mysterious",
  ];

  const sampleContent = `
Reading is one of the most powerful ways to gain knowledge and improve focus.

This sample text is added to test highlighting, bookmarks, and notes.

You should be able to select this text, highlight it, and save notes.

A smooth reading experience is very important for accessibility features.

Please highlight it and test the reading tools properly.

Accessibility matters because every reader should have a smooth and comfortable reading experience.
  `;

  const recommendations = useMemo(() => mockRecommendations, []);

  useEffect(() => {
    document.body.classList.remove("theme-dark", "theme-sepia", "theme-light");

    if (theme === "sepia") {
      document.body.classList.add("theme-sepia");
    } else if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.add("theme-dark");
    }

    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    return () => {
      document.body.classList.remove(
        "theme-dark",
        "theme-sepia",
        "theme-light",
        "high-contrast"
      );
    };
  }, [theme, highContrast]);

  useEffect(() => {
    fetch("http://localhost:8080/api/books")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setCurrentBook(data[0] || null);
        setLoadingBooks(false);
      })
      .catch((err) => {
        console.error("Error loading books:", err);
        setLoadingBooks(false);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/bookmarks")
      .then((res) => res.json())
      .then((data) => setBookmarks(data))
      .catch((err) => console.error("Error loading bookmarks:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/highlights")
      .then((res) => res.json())
      .then((data) => setHighlights(data))
      .catch((err) => console.error("Error loading highlights:", err));
  }, []);

  const handleToggleVibe = (vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe)
        ? prev.filter((item) => item !== vibe)
        : [...prev, vibe]
    );
  };

  const handleSearchVibe = () => {
    if (!vibeInput.trim() && selectedVibes.length === 0) {
      alert("Enter a vibe or select at least one vibe.");
      return;
    }
  
    setSearching(true);
  
    const queryText = `${vibeInput} ${selectedVibes.join(" ")}`.toLowerCase().trim();
    const queryWords = queryText.split(/\s+/).filter(Boolean);
  
    const sourceBooks =
      mockRecommendations && mockRecommendations.length > 0
        ? mockRecommendations
        : books;
  
    const scoredResults = sourceBooks.map((book) => {
      const title = (book.title || "").toLowerCase();
      const author = (book.author || "").toLowerCase();
      const genre = (book.genre || "").toLowerCase();
      const vibes = (book.vibes || "").toLowerCase();
      const why = (book.why || "").toLowerCase();
      const description = (book.description || "").toLowerCase();
  
      let score = 0;
  
      queryWords.forEach((word) => {
        if (title.includes(word)) score += 5;
        if (author.includes(word)) score += 3;
        if (genre.includes(word)) score += 3;
        if (vibes.includes(word)) score += 6;
        if (why.includes(word)) score += 2;
        if (description.includes(word)) score += 2;
      });
  
      return { ...book, score };
    });
  
    let results = scoredResults
      .filter((book) => book.score > 0)
      .sort((a, b) => b.score - a.score);
  
    if (results.length === 0) {
      results = sourceBooks.slice(0, 3).map((book) => ({
        ...book,
        score: 1,
      }));
    }
  
    setTimeout(() => {
      setAiResults(results);
      setSearching(false);
    }, 800);
  };

  const handleViewBook = (book) => {
    setCurrentBook(book);
    setCurrentPage(book?.page || 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleOpenBookmark = (bookmark) => {
    setCurrentPage(bookmark.page);
  };

  const handleAddBookmark = async () => {
    const newBookmark = {
      title: currentBook?.title || "Untitled Book",
      page: currentPage,
      savedAt: new Date().toLocaleString(),
    };

    try {
      const res = await fetch("http://localhost:8080/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBookmark),
      });

      if (!res.ok) {
        throw new Error("Failed to save bookmark");
      }

      const savedBookmark = await res.json();
      setBookmarks((prev) => [...prev, savedBookmark]);
      alert("Bookmark added successfully!");
    } catch (error) {
      console.error("Add bookmark error:", error);
      alert("Failed to add bookmark.");
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/bookmarks/${id}`, {
        method: "DELETE",
      });

      setBookmarks((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete bookmark error:", error);
      alert("Failed to delete bookmark.");
    }
  };

  const handleTextSelection = () => {
    let text = window.getSelection().toString().trim();
    text = text.replace(/\s+/g, " ");

    if (text) {
      setSelectedText(text);
    }
  };

  const renderHighlightedText = (text) => {
    let updatedText = text || "";

    highlights.forEach((h) => {
      if (h.text) {
        const escapedText = h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedText})`, "gi");

        updatedText = updatedText.replace(
          regex,
          '<mark class="highlight">$1</mark>'
        );
      }
    });

    return updatedText;
  };

  const handleAddHighlight = async () => {
    if (!selectedText) {
      alert("Please select text before adding a highlight.");
      return;
    }

    if (highlights.some((h) => h.text.trim().toLowerCase() === selectedText.trim().toLowerCase())) {
      alert("This text is already highlighted.");
      return;
    }

    const newHighlight = {
      bookId: currentBook?.id || 1,
      text: selectedText,
      note: "",
      savedAt: new Date().toLocaleString(),
    };

    try {
      const res = await fetch("http://localhost:8080/api/highlights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHighlight),
      });

      if (!res.ok) {
        throw new Error("Failed to save highlight");
      }

      const savedHighlight = await res.json();
      setHighlights((prev) => [...prev, savedHighlight]);
      setSelectedText("");
      window.getSelection().removeAllRanges();
      alert("Highlight saved successfully!");
    } catch (error) {
      console.error("Highlight save error:", error);
      alert("Failed to save highlight.");
    }
  };

  const handleDeleteHighlight = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/highlights/${id}`, {
        method: "DELETE",
      });

      setHighlights((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete highlight error:", error);
      alert("Failed to delete highlight.");
    }
  };

  const handleUpdateHighlightNote = async (id, value) => {
    if (value.length > 200) {
      alert("Note cannot exceed 200 characters.");
      return;
    }

    const target = highlights.find((item) => item.id === id);
    if (!target) return;

    const updatedHighlight = { ...target, note: value };

    setHighlights((prev) =>
      prev.map((item) => (item.id === id ? updatedHighlight : item))
    );

    try {
      await fetch(`http://localhost:8080/api/highlights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedHighlight),
      });
    } catch (error) {
      console.error("Update note error:", error);
      alert("Failed to update note.");
    }
  };

  const scrollToHighlight = (text) => {
    const marks = document.querySelectorAll("mark.highlight");

    for (const mark of marks) {
      if (mark.textContent.trim().toLowerCase() === text.trim().toLowerCase()) {
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  };

  const handleClearHighlights = async () => {
    try {
      await fetch("http://localhost:8080/api/highlights", {
        method: "DELETE",
      });
      setHighlights([]);
    } catch (error) {
      console.error("Clear highlights error:", error);
      alert("Failed to clear highlights.");
    }
  };

  if (loadingBooks) {
    return <div className="p-6 text-white">Loading books...</div>;
  }

  return (
    <div className="app-bg min-h-screen">
      <Navbar />

      <div className="px-6 py-8">
        <div className="mx-auto grid max-w-[1500px] grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
          <div className="panel space-y-5">
  <div>
    <h2 className="text-3xl font-semibold md:text-4xl">
      Find Books by Vibe
    </h2>
    <p className="mt-2 text-secondary">
      Search by vibe, mood, theme, title, or author
    </p>
  </div>

  <div className="flex flex-wrap gap-3">
    {vibeOptions.map((vibe) => (
      <button
        key={vibe}
        type="button"
        onClick={() => handleToggleVibe(vibe)}
        className={`badge transition ${
          selectedVibes.includes(vibe)
            ? "bg-cyan-400/20 text-cyan-300 border border-cyan-300/40"
            : ""
        }`}
      >
        {vibe}
      </button>
    ))}
  </div>

  <div className="flex flex-col gap-4 md:flex-row">
    <input
      type="text"
      value={vibeInput}
      onChange={(e) => setVibeInput(e.target.value)}
      placeholder="Type a vibe, title, or author..."
      className="flex-1 rounded-xl border border-white/10 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none"
    />
    <button
      onClick={handleSearchVibe}
      className="btn btn-accent w-full md:w-auto"
    >
      Search
    </button>
  </div>
</div>
                

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="panel-hover cursor-default transition hover:scale-[1.02]">
                <p className="text-secondary">Books Available</p>
                <h3 className="mt-3 text-5xl font-semibold">{books.length}</h3>
                <p className="mt-2 text-sm text-secondary">
                  Current: {currentBook?.title || "none"}
                </p>
              </div>

              <div className="panel-hover cursor-default transition hover:scale-[1.02]">
                <p className="text-secondary">Bookmarks Saved</p>
                <h3 className="mt-3 text-5xl font-semibold">
                  {bookmarks.length}
                </h3>
              </div>

              <div className="panel-hover cursor-default transition hover:scale-[1.02]">
                <p className="text-secondary">Highlights Added</p>
                <h3 className="mt-3 text-5xl font-semibold">
                  {highlights.length}
                </h3>
              </div>
            </div>

            <div className="panel space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-secondary">
                  {currentBook?.genre || "Book"}
                </p>
                <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
                  {currentBook?.title || "No book selected"}
                </h1>
                <p className="mt-2 text-2xl text-secondary">
                  {currentBook?.author || "Unknown Author"} •{" "}
                  {currentBook?.publicationYear || "N/A"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="badge flex items-center gap-2">
                  <span style={{ color: "var(--gold)" }}>★</span>
                  <span>{currentBook?.averageRating || currentBook?.rating || "N/A"} (Reader rating)</span>
                </span>

                <button className="btn btn-accent transition hover:scale-[1.03]">
                  Read Now
                </button>
              </div>

              <p className="text-lg text-secondary">
                {currentBook?.description || "No description available."}
              </p>
            </div>

            <div className="panel space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-secondary">
                    Chapter {currentBook?.chapter || 1} • Page {currentPage}
                  </p>
                  {selectedText && (
                    <p className="mt-2 text-sm text-cyan-300">
                      Selected: “{selectedText}”
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button className="btn px-4 py-2" onClick={handlePrevPage}>
                    Prev
                  </button>
                  <button
                    className="btn btn-accent px-4 py-2"
                    onClick={handleNextPage}
                  >
                    Next
                  </button>
                  <button
                    className="btn btn-accent px-4 py-2"
                    onClick={handleAddHighlight}
                  >
                    Highlight
                  </button>
                </div>
              </div>

              <div className={`card border ${
  theme === "light"
    ? "bg-white text-black border-gray-200"
    : "bg-gradient-to-b from-white/[0.03] to-transparent border-white/5"
}`}>
                <div
    
                  className={`space-y-6 ${
                    theme === "light" ? "text-black" : "text-white/90"
                  }`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                  onMouseUp={handleTextSelection}
                >
                  <p
                    className="reader-content"
                    dangerouslySetInnerHTML={{
                      __html: renderHighlightedText(
                        currentBook?.content || sampleContent
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
            {searching ? (
  <div className="panel text-white">Searching...</div>
) : aiResults.length > 0 ? (
  <AIRecommendations
    recommendations={aiResults}
    onView={handleViewBook}
  />
) : (
  <div className="panel space-y-3">
    <h3 className="text-2xl font-semibold">AI Recommendations</h3>
    <p className="text-secondary">
      No matching books found. Try another vibe or title.
    </p>
  </div>
)}

          </div>

          <div className="col-span-12 space-y-6 lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <ReadingToolsPanel
              fontSize={fontSize}
              setFontSize={setFontSize}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              theme={theme}
              setTheme={setTheme}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
            />

            <div className="panel space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Bookmarks</h2>
                  <p className="text-sm text-secondary">
                    Create / Open / Delete
                  </p>
                  <p className="mt-2 text-secondary">
                    Current Page: {currentPage}
                  </p>
                </div>

                <button className="btn btn-accent" onClick={handleAddBookmark}>
                  + Add
                </button>
              </div>

              {bookmarks.length === 0 ? (
                <div className="card p-5 text-secondary">
                  No bookmarks added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="card p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            🔖 {bookmark.title} - Page {bookmark.page}
                          </h3>
                          <p className="mt-2 text-sm text-secondary">
                            Saved: {bookmark.savedAt}
                          </p>
                        </div>

                        <button
                          className="btn"
                          onClick={() => handleOpenBookmark(bookmark)}
                        >
                          Open
                        </button>
                      </div>

                      <button
                        className="btn w-full"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Highlights</h2>
                  <p className="text-sm text-secondary">
                    Select text, save it, add notes, and revisit it
                  </p>
                </div>

                <button className="btn" onClick={handleClearHighlights}>
                  Clear All
                </button>
              </div>

              {highlights.length === 0 ? (
                <div className="card p-5 text-secondary">
                  No highlights added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {highlights.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="card p-5 space-y-5 cursor-pointer"
                      onClick={() => scrollToHighlight(highlight.text)}
                    >
                      <div>
                        <p className="text-sm text-secondary">
                          {highlight.savedAt}
                        </p>
                        <p className="mt-3 text-lg leading-relaxed">
                          {highlight.text}
                        </p>
                      </div>

                      <textarea
                        value={highlight.note || ""}
                        onChange={(e) =>
                          handleUpdateHighlightNote(highlight.id, e.target.value)
                        }
                        placeholder="Add note..."
                        className="input min-h-[110px] w-full resize-none"
                        maxLength={200}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-secondary">
                          {(highlight.note || "").length}/200
                        </p>

                        <button
                          className="btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHighlight(highlight.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}