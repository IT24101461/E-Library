from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from ranker import get_ranked_books, search_books, get_book_by_id, chatbot_response

app = FastAPI(title="Book Ranker API")

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Your React port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Book Ranker API is running!"}


@app.get("/api/books/ranked")
def ranked_books(limit: int = 20):
    """Returns top ranked books using weighted scoring"""
    return get_ranked_books(limit=limit)


@app.get("/api/books/search")
def search(q: str = Query(..., description="Search query"), limit: int = 10):
    """Search books by title, author, or description"""
    return search_books(query=q, limit=limit)


@app.get("/api/books/{book_id}")
def get_book(book_id: int):
    """Get a single book by ID"""
    return get_book_by_id(book_id)


@app.post("/api/chatbot")
def chat(body: dict):
    """Chatbot endpoint - takes user message, returns ranked book suggestions"""
    message = body.get("message", "")
    return chatbot_response(message)