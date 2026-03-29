import pandas as pd
import numpy as np
import os
import re

# ─── Load Dataset ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "books.csv")

df = pd.read_csv(CSV_PATH)

# ─── Clean & Prepare ─────────────────────────────────────────────────────────
df = df.dropna(subset=["title", "average_rating"])
df["original_publication_year"] = pd.to_numeric(df["original_publication_year"], errors="coerce")
df["average_rating"] = pd.to_numeric(df["average_rating"], errors="coerce")
df["description"] = df["description"].fillna("")
df["authors"] = df["authors"].fillna("Unknown")
df["language_code"] = df["language_code"].fillna("eng")
df["image_url"] = df["image_url"].fillna("")

# ─── Weighted Scoring Formula ─────────────────────────────────────────────────
# Score = (rating × 0.6) + (recency × 0.4)
# Both normalized to 0–1 scale so they're comparable

min_year = df["original_publication_year"].min()
max_year = df["original_publication_year"].max()

def compute_score(row):
    # Normalize rating (max is 5)
    rating_score = row["average_rating"] / 5.0

    # Normalize recency (newer = higher score)
    year = row["original_publication_year"]
    if pd.isna(year):
        recency_score = 0.5  # neutral if unknown
    else:
        recency_score = (year - min_year) / (max_year - min_year) if max_year != min_year else 0.5

    # Weighted formula
    return (rating_score * 0.6) + (recency_score * 0.4)

df["score"] = df.apply(compute_score, axis=1)

# ─── Helper: Convert row to dict ─────────────────────────────────────────────
def row_to_dict(row):
    return {
        "book_id": int(row["book_id"]),
        "title": row["title"],
        "authors": row["authors"],
        "average_rating": float(row["average_rating"]),
        "publication_year": int(row["original_publication_year"]) if not pd.isna(row["original_publication_year"]) else None,
        "language": row["language_code"],
        "image_url": row["image_url"],
        "description": row["description"],
        "score": round(float(row["score"]), 4),
    }

# ─── API Functions ────────────────────────────────────────────────────────────

def get_ranked_books(limit: int = 20):
    top = df.sort_values("score", ascending=False).head(limit)
    return {"books": [row_to_dict(r) for _, r in top.iterrows()], "total": len(top)}


def search_books(query: str, limit: int = 10):
    q = query.lower().strip()
    mask = (
        df["title"].str.lower().str.contains(q, na=False) |
        df["authors"].str.lower().str.contains(q, na=False) |
        df["description"].str.lower().str.contains(q, na=False)
    )
    results = df[mask].sort_values("score", ascending=False).head(limit)
    return {"books": [row_to_dict(r) for _, r in results.iterrows()], "total": len(results)}


def get_book_by_id(book_id: int):
    match = df[df["book_id"] == book_id]
    if match.empty:
        return {"error": "Book not found"}
    return row_to_dict(match.iloc[0])


# ─── Chatbot Logic ────────────────────────────────────────────────────────────
KEYWORD_MAP = {
    "romance":     ["love", "romance", "romantic", "relationship", "heart"],
    "fantasy":     ["magic", "fantasy", "dragon", "wizard", "quest", "mythical"],
    "thriller":    ["thriller", "mystery", "suspense", "detective", "crime", "murder"],
    "sci-fi":      ["sci-fi", "science fiction", "space", "future", "robot", "alien"],
    "horror":      ["horror", "scary", "fear", "ghost", "dark", "haunted"],
    "classic":     ["classic", "old", "timeless", "literature", "century"],
    "adventure":   ["adventure", "action", "journey", "explore", "survival"],
    "biography":   ["biography", "real", "true story", "life", "memoir"],
}

def chatbot_response(message: str):
    msg = message.lower()

    # Detect genre intent
    detected_genre = None
    for genre, keywords in KEYWORD_MAP.items():
        if any(kw in msg for kw in keywords):
            detected_genre = genre
            break

    # Detect top/best intent
    wants_top = any(w in msg for w in ["top", "best", "recommend", "popular", "highest"])

    # Detect specific author/title search
    search_triggered = any(w in msg for w in ["by ", "author", "written", "find", "search", "show me", "called"])

    if search_triggered or (not detected_genre and not wants_top):
        # Try direct search
        results = search_books(message, limit=5)
        if results["total"] > 0:
            return {
                "reply": f"Here are some books matching '{message}':",
                "books": results["books"]
            }

    if detected_genre:
        results = search_books(detected_genre, limit=6)
        return {
            "reply": f"Here are some great {detected_genre} books I found for you! 📚",
            "books": results["books"]
        }

    if wants_top:
        results = get_ranked_books(limit=6)
        return {
            "reply": "Here are the top ranked books right now! ⭐",
            "books": results["books"]
        }

    # Default fallback
    top = get_ranked_books(limit=5)
    return {
        "reply": "I'm not sure what you're looking for, but here are some highly rated books to get you started! 😊",
        "books": top["books"]
    }