import axios from 'axios';
import { API_BASE_URL } from '../config';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if available
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error message consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected network error occurred';
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    const customError = new Error(message);
    customError.status = error.response ? error.response.status : 500;
    customError.data = error.response ? error.response.data : null;
    return Promise.reject(customError);
  }
);

export default api;
