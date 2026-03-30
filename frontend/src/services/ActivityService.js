import axios from 'axios';

// Use base URL without trailing /api. Service methods add the /api prefix.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ActivityService = {

  getHistory: (userId) => {
    return apiClient.get(`/api/history?userId=${userId}`);
  },

  // READ - Get reading stats
  getStats: (userId) => {
    return apiClient.get(`/api/stats?userId=${userId}`);
  },

  // READ - Get reading progress for a book
  getProgress: (userId, bookId) => {
    return apiClient.get('/api/progress', {
      params: {
        userId: userId,
        bookId: bookId,
      },
    });
  },

  // CREATE - Add activity (borrow, start reading, etc.)
  createActivity: (activityData) => {
    return apiClient.post('/api/activity', activityData);
  },

  // CREATE/UPDATE - Log reading activity and update progress
  logActivity: (userId, action, bookId, progressData) => {
    return apiClient.put('/api/progress', null, {
      params: {
        userId: userId,
        bookId: bookId,
        currentPage: progressData.currentPage,
        totalPages: progressData.totalPages,
      },
    });
  },

  // UPDATE - Update reading progress
  updateProgress: (progressData) => {
    return apiClient.put('/api/progress', null, {
      params: {
        userId: progressData.userId,
        bookId: progressData.bookId,
        currentPage: progressData.currentPage,
        totalPages: progressData.totalPages,
      },
    });
  },

  // DELETE - Remove activity from history (soft delete)
  deleteActivity: (activityId) => {
    return apiClient.delete(`/api/history/${activityId}`);
  },

  // GET - Fetch all books
  getBooks: () => {
    return apiClient.get('/api/books');
  },

  // GET - Fetch single book details
  getBook: (bookId) => {
    return apiClient.get(`/api/books/${bookId}`);
  },

  // POST - Create new book
  createBook: (bookData, userId) => {
    // If userId provided, send as query param for server-side role check
    const url = userId ? `/api/books?userId=${userId}` : '/api/books';
    return apiClient.post(url, bookData);
  },

  // PUT - Update book details
  updateBook: (bookId, bookData) => {
    return apiClient.put(`/api/books/${bookId}`, bookData);
  },

  // DELETE - Delete a book
  deleteBook: (bookId) => {
    return apiClient.delete(`/api/books/${bookId}`);
  },
};

export default apiClient;