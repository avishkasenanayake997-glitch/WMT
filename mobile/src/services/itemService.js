import api from './api';

export const itemService = {
  async getItems(params = {}) {
    const response = await api.get('/api/items', { params });
    return response.data;
  },

  async getItemById(id) {
    const response = await api.get(`/api/items/${id}`);
    return response.data;
  },

  async createItem(formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const response = await api.post('/api/items', formData, config);
    return response.data;
  },

  async updateItem(id, formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const response = await api.put(`/api/items/${id}`, formData, config);
    return response.data;
  },

  async deleteItem(id) {
    const response = await api.delete(`/api/items/${id}`);
    return response.data;
  },
};
