import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIRecommendation = ({ book }) => {
  const RANKER_BASE = process.env.REACT_APP_RANKER_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no book, skip
    if (!book) {
      console.log('[AIRec] No book provided');
      return;
    }
    
    // Extract available fields
    const title = book.title || book.name || '';
    const description = book.description || '';
    const bookId = book.bookId || book.id || 0;
    
    console.log('[AIRec] Book:', { title, description, bookId });
    
    // If no title AND no description, skip
    if (!title && !description) {
      console.log('[AIRec] No title/description, skipping fetch');
      return;
    }

    let mounted = true;

    const fetch_recommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[AIRec] Fetching from:', RANKER_BASE);
        const response = await fetch(`${RANKER_BASE}/api/recommend/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, id: bookId })
        });
        
        console.log('[AIRec] Response:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (!mounted) return;
        
        console.log('[AIRec] Got recommendations:', data);
        setRecommendations(data.recommendations || []);
        setError(null);
      } catch (err) {
        console.error('[AIRec] Error:', err);
        if (!mounted) return;
        
        setError(err.message || 'Failed to connect');
        setRecommendations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Call immediately
    fetch_recommendations();

    return () => { mounted = false; };
  }, [book, RANKER_BASE]);

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded mt-3 text-sm">⚠️ {error}</div>;
  }

  if (loading) {
    return <div className="p-4 bg-gray-50 rounded mt-3 animate-pulse">Loading recommendations...</div>;
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="flex items-center gap-2 font-bold mb-4">
        <Sparkles size={18} className="text-indigo-500" />
        AI Recommends
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {recommendations.map(rec => (
          <div 
            key={rec.id}
            onClick={() => navigate(`/books/${rec.id}`)}
            className="p-3 border rounded cursor-pointer hover:bg-indigo-50 transition"
          >
            {rec.cover_url && (
              <img src={rec.cover_url} alt={rec.title} className="w-full aspect-[2/3] object-cover rounded mb-2 shadow-sm" />
            )}
            <p className="font-bold text-sm line-clamp-2">{rec.title}</p>
            <p className="text-xs text-gray-500">{rec.author}</p>
            <p className="text-xs text-indigo-600 mt-2">🎯 {rec.match_score}%</p>
=======
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIRecommendation = ({ book }) => {
<<<<<<< HEAD
  const RANKER_BASE = process.env.REACT_APP_RANKER_URL || 'http://127.0.0.1:5000';
=======
  const RANKER_BASE = process.env.REACT_APP_RANKER_URL || 'http://127.0.0.1:5001';
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book || (!book.title && !book.id)) return;

    let cancelled = false;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      const url = `${RANKER_BASE}/api/recommend/text`;
      console.debug('[AIRecommendation] Fetching recommendations for:', book.title);
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: book.title || '',
            description: book.description || '',
            id: book.bookId || book.id || 0
          })
        });
        
        if (!response.ok) {
          const text = await response.text().catch(() => null);
          const msg = `AI service responded ${response.status}` + (text ? `: ${text.substring(0,100)}` : '');
          throw new Error(msg);
        }
        
        const data = await response.json();
        if (cancelled) return;
        
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        } else {
          setRecommendations([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('AI Fetch Error:', err);
        if (cancelled) return;
        setError(`Cannot connect to the AI Engine. ${err.message || err}`);
        setLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [book]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-4 mb-4">
         <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
               <div className="h-4 bg-slate-200 rounded w-1/4"></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="h-32 bg-slate-100 rounded-xl"></div>
                  <div className="h-32 bg-slate-100 rounded-xl"></div>
                  <div className="h-32 bg-slate-100 rounded-xl"></div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mt-4 mb-4">
         <p className="font-bold flex items-center gap-2">⚠️ AI Engine Offline</p>
         <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-4 mb-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-indigo-500" size={24} />
        <h2 className="text-xl font-bold text-slate-800">
          Because you are reading this, AI suggests:
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            onClick={() => navigate(`/books/${rec.id}`)}
            className="group flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-20 h-28 flex-shrink-0 bg-slate-200 rounded shadow-sm overflow-hidden">
              <img 
                src={rec.cover_url || 'https://via.placeholder.com/150x220?text=No+Cover'} 
                alt={rec.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150x220?text=No+Cover' }}
              />
            </div>

            <div className="flex flex-col justify-between py-1">
              <div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-slate-500 text-xs mb-3 line-clamp-1">{rec.author || 'Author'}</p>
                
                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">
                  🎯 {rec.match_score}% Match
                </span>
              </div>
              
              <div className="text-indigo-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                Read Now <ArrowRight size={14} />
              </div>
            </div>
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
          </div>
        ))}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default AIRecommendation;
=======
export default AIRecommendation;
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
