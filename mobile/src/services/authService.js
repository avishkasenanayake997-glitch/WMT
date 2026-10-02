import api from './api';

export const authService = {
  async register(name, email, password, isAdmin = false) {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
      isAdmin,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async checkHealth() {
    const response = await api.get('/api/health');
    return response.data;
  },
};
