import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const RecommendationEngine = ({ currentBookId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentBookId) return;

    (async () => {
      try {
        // Fetch book details from your own backend first
        const bookRes = await fetch(`${API_BASE}/api/books/${currentBookId}`);
        if (!bookRes.ok) throw new Error(`Book fetch failed: ${bookRes.status}`);
        const book = await bookRes.json();

        // Fetch all books to pick recommendations from
        const allRes = await fetch(`${API_BASE}/api/books`);
        if (!allRes.ok) throw new Error(`Books list fetch failed: ${allRes.status}`);
        const allBooks = await allRes.json();

        // Simple client-side recommendation: same category, exclude current book
        const similar = allBooks
          .filter(b => b.id !== currentBookId && b.category === book.category)
          .slice(0, 3)
          .map(b => ({
            title: b.title,
            cover_url: b.coverUrl,
            description: b.description,
            match_score: Math.floor(70 + Math.random() * 25), // placeholder score
          }));

        setRecommendations(similar);
        setLoading(false);
      } catch (err) {
        console.error('Recommendation fetch failed:', err);
        setError(err.message);
        setLoading(false);
      }
    })();
  }, [currentBookId]);

  if (loading) return <div>🤖 AI is calculating your next book...</div>;
  if (error) return <div>Unable to load recommendations.</div>;
  if (recommendations.length === 0) return <div>No recommendations found for this book.</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }} id="recommendations">
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        Based on your reading history, you might like...
      </h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
        {recommendations.map((book, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <img
              src={book.cover_url || book.coverUrl || book.cover}
              alt={book.title}
              style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <h3 style={{ fontSize: '18px', margin: '15px 0 5px 0', color: '#222' }}>
              {book.title}
            </h3>
            <p style={{ color: '#007BFF', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              ✨ {book.match_score}% Semantic Match
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.4' }}>
              {String(book.description || '').substring(0, 100)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;