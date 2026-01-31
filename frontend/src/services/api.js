import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Bank APIs
export const bankAPI = {
  getAll: () => api.get('/banks'),
  add: (data) => api.post('/banks', data),
  update: (id, data) => api.put(`/banks/${id}`, data),
  delete: (id) => api.delete(`/banks/${id}`),
  getSummary: () => api.get('/banks/summary'),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  add: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getMonthlySummary: (params) => api.get('/transactions/summary/monthly', { params }),
  getCategories: () => api.get('/transactions/categories'),
};

// Demat APIs
export const dematAPI = {
  getAll: () => api.get('/demat'),
  add: (data) => api.post('/demat', data),
  update: (id, data) => api.put(`/demat/${id}`, data),
  delete: (id) => api.delete(`/demat/${id}`),
};

// Investment APIs
export const investmentAPI = {
  getAll: (params) => api.get('/investments', { params }),
  add: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
  getPortfolioSummary: () => api.get('/investments/portfolio/summary'),
};

// Stock APIs (Enhanced with Indian market data)
export const stockAPI = {
  // Legacy endpoints (backward compatibility)
  getPrice: (symbol) => api.get(`/stocks/${symbol}`),
  getMultiplePrices: (symbols) => api.post('/stocks/bulk', { symbols }),
  
  // New market price endpoints (near real-time with day change %)
  getMarketPrice: (symbol) => api.get(`/stocks/market/price/${symbol}`),
  getMultipleMarketPrices: (symbols) => api.get('/stocks/market/price', { params: { symbols: symbols.join(',') } }),
  
  // Stock list & search endpoints
  getStockList: (page = 1, pageSize = 50, exchange = null) => 
    api.get('/stocks/list', { params: { page, pageSize, exchange } }),
  
  searchStocks: (query) => 
    api.get('/stocks/list', { params: { search: query } }),
  
  searchAutocomplete: (query) => 
    api.get('/stocks/search/autocomplete', { params: { q: query } }),
  
  // Get specific stock details with live price
  getStockDetails: (symbol) => api.get(`/stocks/${symbol}`),
  
  // Market statistics
  getMarketStats: () => api.get('/stocks/market/stats'),
  
  // Admin: Reload stock master
  initStockMaster: () => api.post('/stocks/admin/init'),
};

// Profile APIs
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadPhoto: (formData) => 
    api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
