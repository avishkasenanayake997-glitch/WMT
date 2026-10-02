import api from './api';

export const claimService = {
  async getClaims(params = {}) {
    const response = await api.get('/api/claims', { params });
    return response.data;
  },

  async getClaimById(id) {
    const response = await api.get(`/api/claims/${id}`);
    return response.data;
  },

  async createClaim(data) {
    const response = await api.post('/api/claims', data);
    return response.data;
  },

  async updateClaimStatus(id, status) {
    const response = await api.put(`/api/claims/${id}/status`, { status });
    return response.data;
  },

  async cancelClaim(id) {
    const response = await api.put(`/api/claims/${id}/cancel`);
    return response.data;
  },

  async deleteClaim(id) {
    const response = await api.delete(`/api/claims/${id}`);
    return response.data;
  },
};
