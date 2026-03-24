import axios from "axios";

export const reviewApi = {
  getSummary: (bookId) => axios.get(`/api/reviews/summary`, { params: { bookId } }),

  list: (params) => axios.get(`/api/reviews`, { params }),

  create: (payload) => axios.post(`/api/reviews`, payload),

  update: (id, userId, payload) =>
    axios.put(`/api/reviews/${id}`, payload, { params: { userId } }),

  softDelete: (id, deletedBy = "ADMIN", reason = "Moderation") =>
    axios.delete(`/api/reviews/${id}`, { params: { deletedBy, reason } }),
};