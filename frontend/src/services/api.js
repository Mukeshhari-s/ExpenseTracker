import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_CACHE_TTL = 15000;
const responseCache = new Map();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const buildCacheKey = (url, params) => {
  if (!params) return url;
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const invalidateCache = () => {
  responseCache.clear();
};

const cachedGet = async (url, params, ttl = DEFAULT_CACHE_TTL) => {
  const key = buildCacheKey(url, params);
  const cached = responseCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    return cached.response;
  }

  const response = await api.get(url, { params });
  responseCache.set(key, { response, timestamp: now });
  return response;
};

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

export const getApiErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.error || error?.message || fallback;

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => cachedGet('/auth/me'),
};

// Bank APIs
export const bankAPI = {
  getAll: () => cachedGet('/banks'),
  add: (data) => api.post('/banks', data).finally(invalidateCache),
  update: (id, data) => api.put(`/banks/${id}`, data).finally(invalidateCache),
  delete: (id) => api.delete(`/banks/${id}`).finally(invalidateCache),
  getSummary: () => cachedGet('/banks/summary'),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params) => cachedGet('/transactions', params),
  add: (data) => api.post('/transactions', data).finally(invalidateCache),
  update: (id, data) => api.put(`/transactions/${id}`, data).finally(invalidateCache),
  delete: (id) => api.delete(`/transactions/${id}`).finally(invalidateCache),
  getMonthlySummary: (params) => cachedGet('/transactions/summary/monthly', params),
  getCategories: () => cachedGet('/transactions/categories'),
};

// Demat APIs
export const dematAPI = {
  getAll: () => cachedGet('/demat'),
  add: (data) => api.post('/demat', data).finally(invalidateCache),
  update: (id, data) => api.put(`/demat/${id}`, data).finally(invalidateCache),
  delete: (id) => api.delete(`/demat/${id}`).finally(invalidateCache),
};

// Investment APIs
export const investmentAPI = {
  getAll: (params) => cachedGet('/investments', params),
  add: (data) => api.post('/investments', data).finally(invalidateCache),
  update: (id, data) => api.put(`/investments/${id}`, data).finally(invalidateCache),
  delete: (id) => api.delete(`/investments/${id}`).finally(invalidateCache),
  getPortfolioSummary: () => cachedGet('/investments/portfolio/summary'),
};

// Stock APIs (Enhanced with Indian market data)
export const stockAPI = {
  // Legacy endpoints (backward compatibility)
  getPrice: (symbol) => cachedGet(`/stocks/${symbol}`),
  getMultiplePrices: (symbols) => api.post('/stocks/bulk', { symbols }),
  
  // New market price endpoints (near real-time with day change %)
  getMarketPrice: (symbol) => cachedGet(`/stocks/market/price/${symbol}`),
  getMultipleMarketPrices: (symbols) => cachedGet('/stocks/market/price', { symbols: symbols.join(',') }),
  
  // Stock list & search endpoints
  getStockList: (page = 1, pageSize = 50, exchange = null) => 
    cachedGet('/stocks/list', { page, pageSize, exchange }),
  
  searchStocks: (query) => 
    cachedGet('/stocks/list', { search: query }, 5000),
  
  searchAutocomplete: (query) => 
    cachedGet('/stocks/search/autocomplete', { q: query }, 5000),
  
  // Get specific stock details with live price
  getStockDetails: (symbol) => cachedGet(`/stocks/${symbol}`),
  
  // Market statistics
  getMarketStats: () => cachedGet('/stocks/market/stats'),
  
  // Admin: Reload stock master
  initStockMaster: () => api.post('/stocks/admin/init').finally(invalidateCache),
};

// Profile APIs
export const profileAPI = {
  get: () => cachedGet('/profile'),
  update: (data) => api.put('/profile', data).finally(invalidateCache),
  uploadPhoto: (formData) => 
    api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).finally(invalidateCache),
};

export default api;
