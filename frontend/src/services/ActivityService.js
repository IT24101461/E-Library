import axios from 'axios';

<<<<<<< HEAD
// Use base URL without trailing /api. Service methods add the /api prefix
=======
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ActivityService = {
 
  getHistory: (userId) => {
<<<<<<< HEAD
    return apiClient.get(`/api/history?userId=${userId}`);
=======
    return apiClient.get(`/history?userId=${userId}`);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // READ - Get reading stats
  getStats: (userId) => {
<<<<<<< HEAD
    return apiClient.get(`/api/stats?userId=${userId}`);
=======
    return apiClient.get(`/stats?userId=${userId}`);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // READ - Get reading progress for a book
  getProgress: (userId, bookId) => {
<<<<<<< HEAD
    return apiClient.get('/api/progress', {
=======
    return apiClient.get('/progress', {
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
      params: {
        userId: userId,
        bookId: bookId,
      },
    });
  },

  // CREATE - Add activity (borrow, start reading, etc.)
  createActivity: (activityData) => {
<<<<<<< HEAD
    return apiClient.post('/api/activity', activityData);
=======
    return apiClient.post('/activity', activityData);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // CREATE/UPDATE - Log reading activity and update progress
  logActivity: (userId, action, bookId, progressData) => {
<<<<<<< HEAD
    return apiClient.put('/api/progress', null, {
=======
    return apiClient.put('/progress', null, {
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
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
<<<<<<< HEAD
    return apiClient.put('/api/progress', null, {
=======
    return apiClient.put('/progress', null, {
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
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
<<<<<<< HEAD
    return apiClient.delete(`/api/history/${activityId}`);
=======
    return apiClient.delete(`/history/${activityId}`);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // GET - Fetch all books
  getBooks: () => {
<<<<<<< HEAD
    return apiClient.get('/api/books');
=======
    return apiClient.get('/books');
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // GET - Fetch single book details
  getBook: (bookId) => {
<<<<<<< HEAD
    return apiClient.get(`/api/books/${bookId}`);
=======
    return apiClient.get(`/books/${bookId}`);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // POST - Create new book
  createBook: (bookData, userId) => {
    // If userId provided, send as query param for server-side role check
<<<<<<< HEAD
    const url = userId ? `/api/books?userId=${userId}` : '/api/books';
=======
    const url = userId ? `/books?userId=${userId}` : '/books';
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
    return apiClient.post(url, bookData);
  },

  // PUT - Update book details
  updateBook: (bookId, bookData) => {
<<<<<<< HEAD
    return apiClient.put(`/api/books/${bookId}`, bookData);
=======
    return apiClient.put(`/books/${bookId}`, bookData);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },

  // DELETE - Delete a book
  deleteBook: (bookId) => {
<<<<<<< HEAD
    return apiClient.delete(`/api/books/${bookId}`);
=======
    return apiClient.delete(`/books/${bookId}`);
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
  },
};

export default apiClient;
