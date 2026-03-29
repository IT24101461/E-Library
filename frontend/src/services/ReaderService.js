import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reader';

export const ReaderService = {
  // Bookmarks
  getBookmarks: (userId, bookId) => {
    return axios.get(`${API_URL}/bookmarks`, { params: bookId ? { userId, bookId } : { userId } });
  },

  addBookmark: (data) => {
    // data: { userId, bookId, pageNumber }
    return axios.post(`${API_URL}/bookmarks`, data);
  },

  deleteBookmark: (id) => {
    return axios.delete(`${API_URL}/bookmarks/${id}`);
  },

  // Highlights
  getHighlights: (userId, bookId) => {
    return axios.get(`${API_URL}/highlights`, { params: bookId ? { userId, bookId } : { userId } });
  },

  addHighlight: (data) => {
    // data: { userId, bookId, pageNumber, content, color }
    return axios.post(`${API_URL}/highlights`, data);
  },

  deleteHighlight: (id) => {
    return axios.delete(`${API_URL}/highlights/${id}`);
  }
};
