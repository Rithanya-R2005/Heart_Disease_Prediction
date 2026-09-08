import axios from 'axios';

// Use the Vite proxy (/api → http://localhost:8000) in development.
// The VITE_API_URL env var can override this for production builds.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect on 401 (only for non-auth routes)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/login') && !url.includes('/signup')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },

  predictHeartDisease: async (healthData) => {
    const response = await api.post('/api/predict', healthData);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/healthchecks');
    return response.data;
  },

  getLatest: async () => {
    const response = await api.get('/api/healthchecks/latest');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/healthchecks/${id}`);
    return response.data;
  },
};



export default api;
