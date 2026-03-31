import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
import styles from './BooksPage.module.css';

const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [authUser, setAuthUser] = useState(null);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
  }, [theme]);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
    else setAuthUser(null);
  }, []);

  const userId = authUser?.id || 1;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await ActivityService.getBooks();
      setBooks(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const openPdfUrl = (url) => {
    if (!url) {
      alert('No PDF available for this book.');
      return;
    }
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowing(true);
      await ActivityService.createActivity({ bookId, userId, action: 'BORROW' });
      setSelectedBook(null);
      fetchBooks();
      // Do not auto-open the reader when borrowing; instead create an initial progress record
      try {
        await ActivityService.updateProgress({ userId, bookId, currentPage: 1, totalPages: (selectedBook && (selectedBook.totalPages || selectedBook.pages)) || 0 });
      } catch (e) {
        // ignore progress creation errors, activity was created
        console.warn('Failed to initialize progress on borrow', e);
      }
    } catch (err) {
      console.error('Failed to borrow book:', err);
      alert('Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  const filteredBooks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return books;
    return books.filter(b =>
      (b.title || '').toLowerCase().includes(term) ||
      (b.author || '').toLowerCase().includes(term) ||
      (b.category || '').toLowerCase().includes(term)
    );
  }, [books, searchTerm]);

  return (
<<<<<<< HEAD
    <main className={styles['books-page']} data-theme={theme}>
=======
<<<<<<< HEAD
    <main className={styles['books-page']} data-theme={theme}>
=======
<<<<<<< HEAD
    <main className={styles['books-page']} data-theme={theme}>
=======
    <main className={styles['books-page']}>
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      <div className={styles['books-container']}>
        <header className={styles['books-header']}>
          <div>
            <h1 className={styles['books-title']}>Library</h1>
            <p className={styles['books-desc']}>Browse, preview and borrow books from the collection.</p>
          </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
          <div className={styles['books-search-row']}>
            <div className={styles['theme-options']}>
              <button className={theme === 'light' ? styles['theme-btn-active'] : ''} onClick={() => setTheme('light')}>Light</button>
              <button className={theme === 'dark' ? styles['theme-btn-active'] : ''} onClick={() => setTheme('dark')}>Dark</button>
              <button className={theme === 'sepia' ? styles['theme-btn-active'] : ''} onClick={() => setTheme('sepia')}>Sepia</button>
            </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
            <div className={styles['books-search-row']}>
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
            <div className={styles['books-search-container']}>
              <input
                type="search"
                aria-label="Search books"
                placeholder="Search by title, author or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['books-search-input']}
              />
              <svg className={styles['books-search-icon']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {authUser && authUser.role === 'ADMIN' ? (
              <button
                onClick={() => navigate('/books/add')}
                className={styles['books-add-btn']}
              >
                + Add Book
              </button>
            ) : (
              <button className={styles['books-add-btn']} disabled>
                + Add Book
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : (
          <>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
            <div className="mb-4 text-sm font-semibold opacity-70" style={{color: 'var(--text-secondary)'}}>{filteredBooks.length} books available</div>

            {filteredBooks.length === 0 ? (
              <div className="py-12 text-center text-xl font-medium" style={{color: 'var(--text-secondary)'}}>No books match your search.</div>
            ) : (
              <section className={styles['books-grid']}>
                {filteredBooks.map((book) => (
                  <article key={book.id} className={styles['book-card']}>
                    <div className={styles['book-card-image-wrapper']}>
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className={styles['book-card-image']} />
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
            <div className="mb-4 text-sm text-gray-600">{filteredBooks.length} books</div>

            {filteredBooks.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No books match your search.</div>
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <article key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition">
                    <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                      ) : (
                        <div className="text-6xl">📚</div>
                      )}
                    </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                    <div className={styles['book-card-content']}>
                      <h3 className={styles['book-card-title']} title={book.title}>{book.title}</h3>
                      <p className={styles['book-card-author']}>{book.author}</p>

                      <div className={styles['book-card-meta']}>
                        <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600}}>
                          {book.totalPages || book.pages || '-'} PAGES
                        </span>
                        <span className={styles['book-card-badge']}>{book.category || 'General'}</span>
                      </div>

                      <div className={styles['book-card-actions']}>
                        <button
                          onClick={() => openPdfUrl(book.pdfUrl || book.pdfUrl)}
                          className={styles['book-btn-preview']}
                          style={{marginRight: 'auto'}}
                        >
                          Preview ↓
                        </button>
                        <button
                          onClick={() => setSelectedBook(book)}
                          className={styles['book-btn-borrow']}
                          disabled={!book.isAvailable}
                        >
                          {book.isAvailable ? 'Borrow' : 'Unavailable'}
                        </button>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{book.author}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span className="inline-block mr-2">{book.totalPages || book.pages || '-'} pages</span>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs">{book.category || 'General'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPdfUrl(book.pdfUrl || book.pdfUrl)}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => setSelectedBook(book)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${book.isAvailable ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            disabled={!book.isAvailable}
                          >
                            {book.isAvailable ? 'Borrow' : 'Unavailable'}
                          </button>
                        </div>
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {/* Modal */}
        {selectedBook && (
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
          <div className={styles['modal-overlay']} onClick={() => setSelectedBook(null)}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['modal-grid']}>
                <div className="md:col-span-1 border-r border-gray-100 border-opacity-10 pr-0 md:pr-6 flex items-center justify-center">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full object-cover rounded-xl shadow-lg border border-white border-opacity-10" style={{maxHeight: '340px'}} />
                  ) : (
                    <div className="w-full h-64 rounded-xl flex items-center justify-center text-5xl" style={{background: 'var(--image-placeholder-bg)'}}>📚</div>
                  )}
                </div>

                <div className="md:col-span-2 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={styles['modal-title']}>{selectedBook.title}</h2>
                      <p className={styles['modal-author']}>{selectedBook.author}</p>
                    </div>
                    <button onClick={() => setSelectedBook(null)} className={styles['modal-close']}>✕</button>
                  </div>

                  <div className={styles['modal-details']}>
                    <div>
                      <div className={styles['modal-detail-label']}>Category</div>
                      <div className={styles['modal-detail-value']}>{selectedBook.category || '-'}</div>
                    </div>
                    <div>
                      <div className={styles['modal-detail-label']}>Pages</div>
                      <div className={styles['modal-detail-value']}>{selectedBook.totalPages || selectedBook.pages || '-'}</div>
                    </div>
                    <div>
                      <div className={styles['modal-detail-label']}>ISBN</div>
                      <div className={styles['modal-detail-value']} style={{fontFamily: 'monospace'}}>{selectedBook.isbn || '-'}</div>
                    </div>
                    <div>
                      <div className={styles['modal-detail-label']}>Status</div>
                      <div className={styles['modal-detail-value']} style={{color: selectedBook.isAvailable ? '#10b981' : '#ef4444'}}>
                        {selectedBook.isAvailable ? '● Available' : '● Unavailable'}
                      </div>
                    </div>
                  </div>

                  <div className={styles['modal-desc']}>{selectedBook.description}</div>

                  <div className={styles['modal-actions']}>
                    <button onClick={() => openPdfUrl(selectedBook.pdfUrl)} className={styles['modal-btn-secondary']}>Preview PDF</button>
                    <button
                      onClick={() => handleBorrowBook(selectedBook.id)}
                      disabled={!selectedBook.isAvailable || borrowing}
                      className={styles['book-btn-borrow']}
                      style={{flex: 1.5, padding: '0.75rem', fontSize: '1rem'}}
                    >
                      {borrowing ? 'Processing...' : (selectedBook.isAvailable ? 'Borrow Book' : 'Unavailable')}
                    </button>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="md:col-span-1">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-64 object-cover rounded" />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center text-4xl">📚</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedBook.author}</p>
                    </div>
                    <button onClick={() => setSelectedBook(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Category</div>
                      <div className="font-medium">{selectedBook.category || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pages</div>
                      <div className="font-medium">{selectedBook.totalPages || selectedBook.pages || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">ISBN</div>
                      <div className="font-mono text-sm">{selectedBook.isbn || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className={`font-medium ${selectedBook.isAvailable ? 'text-green-600' : 'text-red-600'}`}>{selectedBook.isAvailable ? 'Available' : 'Unavailable'}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-gray-700">{selectedBook.description}</div>

                  <div className="mt-6 flex gap-3">
                    <button onClick={() => openPdfUrl(selectedBook.pdfUrl)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded">Preview PDF</button>
                    <button
                      onClick={() => handleBorrowBook(selectedBook.id)}
                      disabled={!selectedBook.isAvailable || borrowing}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded disabled:opacity-60"
                    >
                      {borrowing ? 'Processing...' : (selectedBook.isAvailable ? 'Borrow Book' : 'Unavailable')}
                    </button>
                    <button onClick={() => setSelectedBook(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded">Close</button>
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default BooksPage;
