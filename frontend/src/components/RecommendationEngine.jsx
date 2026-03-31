import React, { useState, useEffect } from 'react';

const RecommendationEngine = ({ currentBookId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentBookId) return;

    const fetchForId = async (id) => {
      const res = await fetch(`http://localhost:5000/api/recommend/${id}`);
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${body}`);
      }
      return res.json();
    };

    (async () => {
      try {
        const result = await fetchForId(currentBookId);
        setRecommendations(result.recommendations || []);
        setLoading(false);
      } catch (firstErr) {
        console.warn('Primary recommendation fetch failed, trying fallback. Error:', firstErr);
        // Fallback: try a known id from the local book.csv dataset (Great Gatsby = 4671)
        try {
          const fallback = await fetchForId(4671);
          setRecommendations(fallback.recommendations || []);
          setLoading(false);
        } catch (fallbackErr) {
          console.error('Fallback recommendation fetch also failed:', fallbackErr);
          setError(firstErr.message || 'Failed to load recommendations');
          setLoading(false);
        }
      }
    })();
  }, [currentBookId]);

  if (loading) return <div>🤖 AI is calculating your next book...</div>;
  if (error) return <div>Error loading recommendations. Is the AI server running?</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }} id="recommendations">
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        Based on your reading history, you might like...
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
        {recommendations.slice(0, 3).map((book, index) => (
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
              ✨ {book.match_score ?? book.matchScore ?? book.score}% Semantic Match
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.4' }}>
              {String(book.description || book.summary || '').substring(0, 100)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;