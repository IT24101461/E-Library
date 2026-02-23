/* ============================================================
   bookshelf.js — Feature 4: Personal Bookshelf / Favourites
   e-Library Project | IT2150 | DS 2.2 G17

   MySQL Table Structure (for backend integration):
   -------------------------------------------------
   CREATE TABLE user_favourites (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     user_id     INT NOT NULL,
     book_id     INT NOT NULL,
     book_title  VARCHAR(255),
     author      VARCHAR(255),
     genre       VARCHAR(100),
     rating      DECIMAL(2,1),
     cover_emoji VARCHAR(10),
     list_name   VARCHAR(100),
     status      VARCHAR(50),
     progress    INT DEFAULT 0,
     date_added  DATETIME DEFAULT NOW(),
     UNIQUE KEY no_dupe (user_id, book_id, list_name),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ============================================================ */


  /* ============================================================
   * DATA STORE
   * Pre-loaded with sample data for demo.
   * Replace with fetch() calls to Java Servlet endpoints.
   * ============================================================ */
  const bookshelf = {
    favourites: [],
    reading: [
      { id: 101, title: "The Great Gatsby",    author: "F. Scott Fitzgerald", emoji: "🎩", genre: "Classic", rating: 4.2, status: "currently reading", progress: 62 },
      { id: 102, title: "1984",                author: "George Orwell",        emoji: "👁️", genre: "Sci-Fi",  rating: 4.7, status: "currently reading", progress: 35 },
    ],
    wishlist: [
      { id: 201, title: "The Name of the Wind", author: "Patrick Rothfuss",     emoji: "💨", genre: "Fantasy", rating: 4.9, status: "new" },
      { id: 202, title: "Sherlock Holmes",       author: "Arthur Conan Doyle",   emoji: "🔍", genre: "Mystery", rating: 4.5, status: "new" },
    ],
    custom: []
  };

  /* State variables */
  let currentView    = 'grid';
  let genreFilter    = 'all';
  let searchQuery    = '';
  let sortMode       = 'date';
  let nextId         = 300;

  /* Pending action state for modals */
  let pendingClearList      = null;
  let pendingMoveBookId     = null;
  let pendingMoveSourceList = null;


  /* ============================================================
   * ADD TO FAVOURITES — CREATE (called from any book detail page)
   *
   * Java Servlet Endpoint: POST /api/bookshelf/add
   * Request Body (JSON):
   *   { userId, bookId, bookTitle, author, genre, rating, listName: 'favourites' }
   * Response: { success: true, id: <new_row_id> }
   *
   * How other group members use this:
   *   1. Link bookshelf.js in their HTML (or call via shared script)
   *   2. Add the .btn-add-fav button (copy from bookshelf.html)
   *   3. Call: addToFavourites('Book Title', 'Author', '📗', 'Genre', 4.5)
   * ============================================================ */
  function addToFavourites(title, author, emoji, genre, rating) {
    const btn  = document.getElementById('mainAddFavBtn');
    const icon = document.getElementById('favBtnIcon');
    const text = document.getElementById('favBtnText');

    /* Prevent duplicate entries */
    const exists = bookshelf.favourites.find(b => b.title === title);
    if (exists) {
      showToast('⭐', `"${title}" is already in Favourites!`);
      return;
    }

    const newBook = {
      id:       nextId++,
      title,
      author,
      emoji:    emoji  || '📚',
      genre:    genre  || 'General',
      rating:   rating || 0,
      status:   'new',
      progress: 0
    };

    /* Add to local store */
    bookshelf.favourites.push(newBook);

    /* ---- Uncomment when Java Servlet backend is ready ----
    fetch('/api/bookshelf/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:    getCurrentUserId(),
        bookId:    newBook.id,
        bookTitle: title,
        author:    author,
        genre:     genre,
        rating:    rating,
        listName:  'favourites'
      })
    })
    .then(res => res.json())
    .then(data => console.log('Saved to DB:', data))
    .catch(err => console.error('Error saving:', err));
    ------------------------------------------------------- */

    /* Button state feedback */
    btn.classList.add('added');
    icon.textContent = '✅';
    text.textContent = 'ADDED TO FAVOURITES';
    btn.disabled = true;

    renderAll();
    showToast('⭐', `"${title}" added to Favourites!`);

    /* Smooth scroll to bookshelf section */
    setTimeout(() => {
      const listEl = document.getElementById('list-fav');
      if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  }


  /* ============================================================
   * REMOVE BOOK FROM LIST — DELETE
   *
   * Java Servlet Endpoint: DELETE /api/bookshelf/remove
   * Query Params: ?userId=X&bookId=Y&listName=Z
   * ============================================================ */
  function removeBook(id, listKey) {
    const list = bookshelf[listKey];
    const book = list.find(b => b.id === id);
    if (!book) return;

    bookshelf[listKey] = list.filter(b => b.id !== id);

    /* ---- Uncomment when backend is ready ----
    fetch(`/api/bookshelf/remove?userId=${getCurrentUserId()}&bookId=${id}&listName=${listKey}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => console.log('Removed:', data))
    .catch(err => console.error('Error removing:', err));
    ------------------------------------------ */

    renderAll();
    showToast('🗑️', `"${book.title}" removed`);
  }


  /* ============================================================
   * CLEAR ENTIRE LIST — DELETE (with confirmation modal)
   *
   * Java Servlet Endpoint: DELETE /api/bookshelf/clearList
   * Query Params: ?userId=X&listName=Y
   * ============================================================ */
  function clearList(listKey) {
    pendingClearList = listKey;
    document.getElementById('confirmText').textContent =
      `This will remove all books from your "${listKey}" list. This cannot be undone.`;
    openModal('confirmModal');
  }

  function confirmClear() {
    if (!pendingClearList) return;

    bookshelf[pendingClearList] = [];

    /* ---- Uncomment when backend is ready ----
    fetch(`/api/bookshelf/clearList?userId=${getCurrentUserId()}&listName=${pendingClearList}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => console.log('List cleared:', data))
    .catch(err => console.error('Error clearing:', err));
    ------------------------------------------ */

    closeModal('confirmModal');
    renderAll();
    showToast('🗑️', 'List cleared successfully');
    pendingClearList = null;
  }


  /* ============================================================
   * MOVE BOOK BETWEEN LISTS — UPDATE
   *
   * Java Servlet Endpoint: PUT /api/bookshelf/move
   * Request Body (JSON): { userId, bookId, fromList, toList }
   * ============================================================ */
  function openMoveModal(bookId, sourceList) {
    pendingMoveBookId     = bookId;
    pendingMoveSourceList = sourceList;
    openModal('moveModal');
  }

  function moveToList(targetList) {
    if (!pendingMoveBookId || !pendingMoveSourceList) return;

    if (targetList === pendingMoveSourceList) {
      closeModal('moveModal');
      return;
    }

    const sourceArray = bookshelf[pendingMoveSourceList];
    const bookIndex   = sourceArray.findIndex(b => b.id === pendingMoveBookId);
    if (bookIndex === -1) return;

    const book = sourceArray[bookIndex];

    /* Prevent duplicates in target */
    const alreadyInTarget = bookshelf[targetList].find(b => b.id === book.id);
    if (alreadyInTarget) {
      showToast('⚠️', 'This book is already in that list');
      closeModal('moveModal');
      return;
    }

    /* Remove from source, add to target */
    bookshelf[pendingMoveSourceList].splice(bookIndex, 1);
    bookshelf[targetList].push(book);

    /* ---- Uncomment when backend is ready ----
    fetch('/api/bookshelf/move', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:   getCurrentUserId(),
        bookId:   pendingMoveBookId,
        fromList: pendingMoveSourceList,
        toList:   targetList
      })
    })
    .then(res => res.json())
    .then(data => console.log('Moved:', data))
    .catch(err => console.error('Error moving:', err));
    ------------------------------------------ */

    closeModal('moveModal');
    renderAll();
    showToast('✅', `Moved to ${targetList}`);

    pendingMoveBookId     = null;
    pendingMoveSourceList = null;
  }


  /* ============================================================
   * CREATE NEW CUSTOM LIST — CREATE
   *
   * Java Servlet Endpoint: POST /api/bookshelf/createList
   * Request Body (JSON): { userId, listName }
   * ============================================================ */
  function openNewListModal() {
    openModal('newListModal');
  }

  function createNewList() {
    const nameInput = document.getElementById('newListName');
    const name      = nameInput.value.trim();

    if (!name) {
      showToast('⚠️', 'Please enter a list name');
      return;
    }

    /* ---- Uncomment when backend is ready ----
    fetch('/api/bookshelf/createList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:   getCurrentUserId(),
        listName: name
      })
    })
    .then(res => res.json())
    .then(data => console.log('List created:', data))
    .catch(err => console.error('Error creating list:', err));
    ------------------------------------------ */

    nameInput.value = '';
    closeModal('newListModal');
    showToast('📌', `List "${name}" created!`);
  }


  /* ============================================================
   * RENDER — MASTER RENDER FUNCTION
   * Rebuilds all 4 grid sections from data store
   * ============================================================ */
  function renderAll() {
    renderList('fav-grid',      bookshelf.favourites, 'fav-badge',      'favourites');
    renderList('reading-grid',  bookshelf.reading,    'reading-badge',  'reading');
    renderList('wishlist-grid', bookshelf.wishlist,   'wishlist-badge', 'wishlist');
    renderList('custom-grid',   bookshelf.custom,     'custom-badge',   'custom');
    updateCounts();
    updateStats();
  }

  function renderList(gridId, books, badgeId, listKey) {
    const grid  = document.getElementById(gridId);
    const badge = document.getElementById(badgeId);

    badge.textContent = books.length + (books.length === 1 ? ' book' : ' books');

    const filtered = applyFilters(books);

    /* Empty states per list */
    if (filtered.length === 0) {
      const emptyMessages = {
        favourites: ['⭐', 'No favourites yet',           'Click "Add to Favourites" on any book page'],
        reading:    ['📖', 'Not reading anything yet',    'Start reading a book to track your progress'],
        wishlist:   ['🎯', 'Your wishlist is empty',      'Save books you want to read later'],
        custom:     ['📌', 'No books here yet',           'Move books here from other sections']
      };
      const [icon, title, desc] = emptyMessages[listKey] || ['📚', 'No books', 'Add books to get started'];

      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icon}</div>
          <div class="empty-title">${title}</div>
          <div class="empty-desc">${desc}</div>
        </div>`;
      grid.classList.remove('book-list-view');
      return;
    }

    /* Apply view mode */
    if (currentView === 'list') {
      grid.classList.add('book-list-view');
    } else {
      grid.classList.remove('book-list-view');
    }

    grid.innerHTML = filtered
      .map((book, i) => buildBookCard(book, listKey, i))
      .join('');
  }


  /* ============================================================
   * BUILD BOOK CARD HTML
   * ============================================================ */
  function buildBookCard(book, listKey, index) {
    const statusBadge =
      book.status === 'currently reading' ? `<span class="status-badge status-reading">Reading</span>`   :
      book.status === 'completed'         ? `<span class="status-badge status-completed">Done</span>`     :
      book.status === 'new'               ? `<span class="status-badge status-new">New</span>`            : '';

    const progressBar = (book.progress > 0)
      ? `<div class="progress-bar-cover"><div class="progress-fill" style="width:${book.progress}%"></div></div>`
      : '';

    const coverBg = getCoverGradient(book.genre);

    return `
      <div class="book-card" style="animation-delay:${index * 0.05}s"
           onclick="openBook('${escapeStr(book.title)}')">

        <div class="book-cover">
          <div class="cover-placeholder" style="background:${coverBg}">
            <span>${book.emoji}</span>
            <div class="cover-title">${escapeStr(book.title)}</div>
          </div>
          <div class="cover-gradient"></div>
          ${statusBadge}
          ${progressBar}

          <div class="card-actions">
            <button class="card-action-btn btn-move" title="Move to another list"
              onclick="event.stopPropagation(); openMoveModal(${book.id}, '${listKey}')">↔</button>
            <button class="card-action-btn" title="Remove from list"
              onclick="event.stopPropagation(); removeBook(${book.id}, '${listKey}')">✕</button>
          </div>
        </div>

        <div class="book-info">
          <div class="book-title">${escapeStr(book.title)}</div>
          <div class="book-author">${escapeStr(book.author)}</div>
          <div class="book-meta">
            <span class="book-genre-tag">${book.genre}</span>
            <span class="book-rating-mini">★ <span>${book.rating}</span></span>
          </div>
          <div class="progress-text">${book.progress ? book.progress + '% complete' : 'Not started'}</div>
        </div>
      </div>`;
  }

  /* Genre → gradient colour map */
  function getCoverGradient(genre) {
    const gradients = {
      'Sci-Fi':  'linear-gradient(160deg, #0d1a2e, #1a3a5c)',
      'Fantasy': 'linear-gradient(160deg, #1a0d2e, #3a1a5c)',
      'Mystery': 'linear-gradient(160deg, #1a1a0d, #3a3a1a)',
      'History': 'linear-gradient(160deg, #2e1a0d, #5c3a1a)',
      'Classic': 'linear-gradient(160deg, #0d2e1a, #1a5c3a)',
      'Romance': 'linear-gradient(160deg, #2e0d1a, #5c1a3a)',
    };
    return gradients[genre] || 'linear-gradient(160deg, #1a1a2e, #2a2a4a)';
  }

  /* Escape special chars for safe HTML injection */
  function escapeStr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }


  /* ============================================================
   * FILTERING & SORTING
   * ============================================================ */
  function applyFilters(books) {
    let result = [...books];

    /* Genre filter */
    if (genreFilter !== 'all') {
      result = result.filter(b => b.genre === genreFilter);
    }

    /* Search filter */
    if (searchQuery) {
      result = result.filter(b =>
        b.title.toLowerCase().includes(searchQuery) ||
        b.author.toLowerCase().includes(searchQuery)
      );
    }

    /* Sorting */
    if (sortMode === 'title')  result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === 'author') result.sort((a, b) => a.author.localeCompare(b.author));
    if (sortMode === 'rating') result.sort((a, b) => b.rating - a.rating);
    /* date: default order (most recently added last in array) */

    return result;
  }

  function setGenreFilter(genre, el) {
    genreFilter = genre;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    renderAll();
  }

  function searchBooks(query) {
    searchQuery = query.toLowerCase().trim();
    renderAll();
  }

  function sortBooks(mode) {
    sortMode = mode;
    renderAll();
  }

  function filterBooks(status) {
    /* Sidebar filter — can be expanded to show only matching statuses */
    renderAll();
  }


  /* ============================================================
   * VIEW TOGGLE — Grid / List
   * ============================================================ */
  function setView(view) {
    currentView = view;
    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    renderAll();
  }


  /* ============================================================
   * OPEN BOOK — navigates to book reader (Feature 2 integration)
   *
   * Integration: Replace href below with Feature 2's read page URL.
   * ============================================================ */
  function openBook(title) {
    showToast('📖', `Opening "${title}"...`);
    /* In integration: window.location.href = `/read.html?title=${encodeURIComponent(title)}`; */
  }


  /* ============================================================
   * UPDATE SIDEBAR COUNTS & STATS BAR
   * ============================================================ */
  function updateCounts() {
    const allBooks = Object.values(bookshelf).flat();

    document.getElementById('count-all').textContent       = allBooks.length;
    document.getElementById('count-fav').textContent       = bookshelf.favourites.length;
    document.getElementById('count-reading').textContent   = bookshelf.reading.length;
    document.getElementById('count-wishlist').textContent  = bookshelf.wishlist.length;
    document.getElementById('count-custom').textContent    = bookshelf.custom.length;
    document.getElementById('count-completed').textContent = allBooks.filter(b => b.status === 'completed').length;
    document.getElementById('count-new').textContent       = allBooks.filter(b => b.status === 'new').length;
  }

  function updateStats() {
    const allBooks = Object.values(bookshelf).flat();

    document.getElementById('stat-total').textContent     = allBooks.length;
    document.getElementById('stat-reading').textContent   = bookshelf.reading.length;
    document.getElementById('stat-completed').textContent = allBooks.filter(b => b.status === 'completed').length;
  }


  /* ============================================================
   * SCROLL TO SECTION (sidebar navigation)
   * ============================================================ */
  function scrollToList(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  /* ============================================================
   * MODAL HELPERS
   * ============================================================ */
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  /* Close modal when clicking outside of it */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  });

  /* Close modal with Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open')
        .forEach(m => m.classList.remove('open'));
    }
  });

  /* Submit new list on Enter */
  document.getElementById('newListName')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') createNewList();
  });


  /* ============================================================
   * TOAST NOTIFICATION
   * ============================================================ */
  let toastTimer;

  function showToast(icon, message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastIcon').textContent = icon;
    document.getElementById('toastMsg').textContent  = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }


  /* ============================================================
   * GET CURRENT USER ID
   * Replace with your session/cookie approach.
   * Java Servlet: HttpSession session = request.getSession();
   *               int userId = (int) session.getAttribute("userId");
   * ============================================================ */
  function getCurrentUserId() {
    return 1; /* TODO: Get from session — sessionStorage.getItem('userId') */
  }


  /* ============================================================
   * INITIALISE
   * ============================================================ */
  renderAll();