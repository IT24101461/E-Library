import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryCard = ({ book, onDelete, onSessionComplete }) => {
  const navigate = useNavigate();
  const [isTiming, setIsTiming] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pagesReadDuringSession, setPagesReadDuringSession] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Normalize common field names for total pages and current page
  const totalPages = Number(book.totalPages || book.pages || book.pageSize || book.pagesCount || 0) || 0;
  const currentPage = Number(book.currentPage || book.page || book.current || 0) || 0;
  const hasTotal = totalPages > 1;
  const progressPercent = hasTotal && currentPage ? Math.min((currentPage / totalPages) * 100, 100) : 0;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 hover:scale-105">
      <div className="p-6 flex items-start gap-6">
        {/* Book Cover Image */}
        <div className="w-24 h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-4xl flex-shrink-0 shadow-md group-hover:shadow-lg transition-all overflow-hidden">
          {book.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <span style={{display: book.coverUrl ? 'none' : 'flex'}}>📕</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Author */}
          <div className="mb-3">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 hover:text-indigo-600 transition">{book.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{book.author}</p>
            {book.category && (
              <span className="inline-block mt-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                {book.category}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {hasTotal ? (
            <div className="mb-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600">Reading Progress</span>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-600">📖 Page {currentPage} of {totalPages}</p>
                <p className="text-xs font-medium text-gray-700">{Math.max(0, totalPages - currentPage)} pages left</p>
              </div>
            </div>
          ) : (
            <div className="mb-4 mt-4">
              <p className="text-xs text-gray-600">📖 Page {currentPage || 0}</p>
            </div>
          )}

          {/* Last Read Time */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              Last read: <span className="font-medium text-gray-700">{getTimeAgo(book.lastRead)}</span>
            </span>
            {book.action && (
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <span>📌</span>
                {book.action}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              // start a reading session so the Reading page will auto-start its timer
              try {
                const sess = { bookId: book.bookId || book.id, start: Date.now(), pages: 0 };
                sessionStorage.setItem('readingSession', JSON.stringify(sess));
              } catch (e) {}
              navigate(`/reading/${book.bookId || book.id}?page=${book.currentPage || 1}`);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
            title="Continue reading this book"
          >
            <span>📖</span>
            Continue
          </button>

          {!isTiming ? (
            <button
              onClick={() => {
                try {
                  const sess = { bookId: book.bookId || book.id, start: Date.now(), pages: 0 };
                  sessionStorage.setItem('readingSession', JSON.stringify(sess));
                } catch (e) {}
                // start local timer UI
                setElapsed(0);
                setPagesReadDuringSession(0);
                setIsTiming(true);
                timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
              }}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
              title="Start reading session"
            >
              ⏱️ Start
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-700">
                ⏳ {Math.floor(elapsed / 60)}m {elapsed % 60}s
                <div className="text-xs text-gray-500">Pages: {pagesReadDuringSession}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setPagesReadDuringSession((p) => p + 1)} className="px-2 py-1 bg-indigo-50 rounded">+1</button>
                <button onClick={() => setPagesReadDuringSession((p) => Math.max(0, p - 1))} className="px-2 py-1 bg-indigo-50 rounded">-1</button>
              </div>
              <button
                onClick={async () => {
                  // stop timer and notify parent
                  if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
                  setIsTiming(false);
                  try { sessionStorage.removeItem('readingSession'); } catch (e) {}
                  if (onSessionComplete) {
                    await onSessionComplete(book.bookId || book.id, pagesReadDuringSession, elapsed, pagesReadDuringSession > 0 && elapsed > 0 ? (pagesReadDuringSession * 3600) / elapsed : 0);
                  }
                  setElapsed(0);
                  setPagesReadDuringSession(0);
                }}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Stop
              </button>
            </div>
          )}

          <button
            onClick={() => onDelete(book.id)}
            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove from history"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
