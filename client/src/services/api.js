import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're just checking auth/me on initial load
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('cinebook_token');
        localStorage.removeItem('cinebook_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

