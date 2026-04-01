import axios from 'axios';

// Use base URL without trailing /api. Service methods add the /api prefix
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

  getStats: (userId) => {
    return apiClient.get(`/api/stats?userId=${userId}`);
  },

  getProgress: (userId, bookId) => {
    return apiClient.get('/api/progress', {
      params: {
        userId: userId,
        bookId: bookId,
      },
    });
  },

  createActivity: (activityData) => {
    return apiClient.post('/api/activity', activityData);
  },

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

  deleteActivity: (activityId) => {
    return apiClient.delete(`/api/history/${activityId}`);
  },

  getBooks: () => {
    return apiClient.get('/api/books');
  },

  getBook: (bookId) => {
    return apiClient.get(`/api/books/${bookId}`);
  },

  createBook: (bookData, userId) => {
    const url = userId ? `/api/books?userId=${userId}` : '/api/books';
    return apiClient.post(url, bookData);
  },

  updateBook: (bookId, bookData) => {
    return apiClient.put(`/api/books/${bookId}`, bookData);
  },

  deleteBook: (bookId) => {
    return apiClient.delete(`/api/books/${bookId}`);
  },
};

export default apiClient;