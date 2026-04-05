import React, { useState, useEffect } from 'react';

const RecommendationEngine = ({ currentBookId }) => {
  // 1. Set up state to hold our AI data
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch the data from your PyCharm Flask API when the component loads
  useEffect(() => {
    if (!currentBookId) return;
    // We dynamically pass the currentBookId so it updates based on what the user is reading!
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
    const fetchForId = async (id) => {
      try {
        const res = await fetch(`http://localhost:5000/api/recommend/${id}`);
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} ${body}`);
        }
        const payload = await res.json();
        return payload;
      } catch (err) {
        throw err;
      }
    };

    (async () => {
      try {
        const result = await fetchForId(currentBookId);
        setRecommendations(result.recommendations || []);
        setLoading(false);
      } catch (firstErr) {
        console.warn('Primary recommendation fetch failed, trying fallback id. Error:', firstErr);
        // Fallback: try a known id from the local `book.csv` dataset (Great Gatsby = 4671)
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
    fetch(`http://localhost:8080/recommend/${currentBookId}`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch AI data');
        return response.json();
      })
      .then((data) => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching AI recommendations:', error);
        setError(error.message);
        setLoading(false);
      });
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
  }, [currentBookId]);

  // 3. Simple loading and error screens
  if (loading) return <div>🤖 AI is calculating your next book...</div>;
  if (error) return <div>Error loading recommendations. Is PyCharm running?</div>;

  // 4. Render the UI!
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }} id="recommendations">
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        Based on your reading history, you might like...
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
        {recommendations.slice(0, 3).map((book, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>

            {/* Display the Cover URL from your MySQL Database */}
            <img
              src={book.cover_url || book.coverUrl || book.cover}
              alt={book.title}
              style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '4px' }}
            />

            <h3 style={{ fontSize: '18px', margin: '15px 0 5px 0', color: '#222' }}>
              {book.title}
            </h3>

            {/* Highlight the AI Math Score! */}
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
