import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityService } from '../services/ActivityService';
import AdvancedSearchBar from '../components/AdvancedSearchBar';
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
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');
  
  const [bookshelfLists, setBookshelfLists] = useState(['favourites', 'wishlist']);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
    else setAuthUser(null);
  }, []);

  const userId = authUser?.id || 1;

  useEffect(() => {
    fetchBooks();
    if (userId) fetchBookshelfLists(userId);
  }, [userId]);

  const fetchBookshelfLists = async (uid) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookshelf/all?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        const stdLists = ['favourites', 'wishlist', 'reading'];
        const extracted = data.map(b => b.listName || b.list_name).filter(l => l && !stdLists.includes(l));
        const uniqueCustomLists = [...new Set(extracted)];
        setBookshelfLists(['favourites', 'wishlist', ...uniqueCustomLists]);
      }
    } catch (e) {
      console.warn("Could not fetch bookshelf lists for dropdown UI", e);
    }
  };

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

  const handleAddToBookshelf = async (book, targetListName) => {
    try {
      const response = await fetch('http://localhost:8080/api/bookshelf/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          title: book.title,
          author: book.author || 'Unknown',
          emoji: '📚',
          genre: book.category || 'General',
          rating: 0,
          status: 'new',
          progress: 0,
          listName: targetListName || 'favourites',
          coverImage: book.coverUrl || ''
        })
      });
      if (response.ok) {
        alert(`"${book.title}" added to ${targetListName}!`);
        setShowListDropdown(false);
      } else {
        alert('Failed to add to Bookshelf.');
      }
    } catch (err) {
      console.error('Error adding to bookshelf:', err);
      alert('Network error while adding to Bookshelf.');
    }
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
    <main className={styles['books-page']} data-theme={theme}>
      <div className={styles['books-container']}>
        <header className={styles['books-header']}>
          <div>
            <h1 className={styles['books-title']}>Library</h1>
            <p className={styles['books-desc']}>Browse, preview and borrow books from the collection.</p>
          </div>

          <div className={styles['books-search-row']}>
            <div className={styles['theme-options']}>
              <button className={theme === 'light' ? styles['theme-btn-active'] : ''} onClick={() => setTheme('light')}>Light</button>
              <button className={theme === 'dark' ? styles['theme-btn-active'] : ''} onClick={() => setTheme('dark')}>Dark</button>
              <button className={theme === 'sepia' ? styles['theme-btn-active'] : ''} onClick={() => setTheme('sepia')}>Sepia</button>
            </div>

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

        <div className="my-8 relative z-50">
          <AdvancedSearchBar />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : (
          <>
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
                      ) : (
                        <div className="text-6xl">📚</div>
                      )}
                    </div>

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

                  <div className={styles['modal-actions']} style={{position: 'relative'}}>
                    <button onClick={() => openPdfUrl(selectedBook.pdfUrl)} className={styles['modal-btn-secondary']}>Preview PDF</button>
                    
                    <div style={{position: 'relative'}}>
                      <button onClick={() => {
                        setShowListDropdown(!showListDropdown);
                        setShowNewListInput(false);
                        setNewListName('');
                      }} className={styles['modal-btn-secondary']} style={{color: '#fbbf24', borderColor: '#fbbf24', width: '100%'}}>
                        ⭐ Add to List...
                      </button>
                      
                      {showListDropdown && (
                        <div style={{
                          position: 'absolute', bottom: '110%', left: 0, right: 0, background: 'var(--surface-color)', 
                          border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 0', zIndex: 100,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden'
                        }}>
                          <div style={{padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Choose List</div>
                          {bookshelfLists.map(list => (
                            <div 
                              key={list}
                              onClick={() => handleAddToBookshelf(selectedBook, list)}
                              style={{
                                padding: '10px 16px', cursor: 'pointer', color: 'var(--text-primary)',
                                borderBottom: '1px solid var(--border-color)', fontSize: '14px', textTransform: 'capitalize'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {list === 'favourites' ? '⭐ Favourites' : list === 'wishlist' ? '🎯 Want to Read' : `📌 ${list}`}
                            </div>
                          ))}
                          
                          {/* Create New List Option */}
                          {!showNewListInput ? (
                            <div 
                              onClick={(e) => { e.stopPropagation(); setShowNewListInput(true); }}
                              style={{
                                padding: '10px 16px', cursor: 'pointer', color: '#4f46e5',
                                fontWeight: 'bold', fontSize: '13px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.05))'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              ＋ Create New List...
                            </div>
                          ) : (
                            <div style={{ padding: '8px 12px', display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                              <input 
                                type="text" 
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="List name..."
                                style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'transparent', color: 'inherit', maxWidth: '140px' }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newListName.trim()) {
                                    handleAddToBookshelf(selectedBook, newListName.trim());
                                    setShowNewListInput(false);
                                    setNewListName('');
                                  }
                                }}
                              />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if(newListName.trim()) handleAddToBookshelf(selectedBook, newListName.trim());
                                  setShowNewListInput(false);
                                  setNewListName('');
                                }}
                                style={{ padding: '4px 10px', background: '#4f46e5', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                              >Save</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleBorrowBook(selectedBook.id)}
                      disabled={!selectedBook.isAvailable || borrowing}
                      className={styles['book-btn-borrow']}
                      style={{flex: 1.5, padding: '0.75rem', fontSize: '1rem'}}
                    >
                      {borrowing ? 'Processing...' : (selectedBook.isAvailable ? 'Borrow Book' : 'Unavailable')}
                    </button>
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
