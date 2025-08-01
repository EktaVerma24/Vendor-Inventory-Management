import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('airport_vendor_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
};

// Vendor Application API
export const vendorApplicationAPI = {
  submit: (applicationData) => api.post('/vendor-applications/submit', applicationData),
  getAll: () => api.get('/vendor-applications'),
  getById: (id) => api.get(`/vendor-applications/${id}`),
  updateStatus: (id, status, reviewedBy, reason = '') => 
    api.patch(`/vendor-applications/${id}/status`, { status, reviewedBy, reason }),
  getByStatus: (status) => api.get(`/vendor-applications/status/${status}`),
  checkByEmail: (email) => api.get(`/vendor-applications/check/${email}`),
};

// Shop API
export const shopAPI = {
  create: (shopData) => api.post('/shops', shopData),
  getAll: () => api.get('/shops'),
  getById: (id) => api.get(`/shops/${id}`),
  update: (id, shopData) => api.put(`/shops/${id}`, shopData),
  delete: (id) => api.delete(`/shops/${id}`),
  getByVendor: (vendorId) => api.get(`/shops/vendor/${vendorId}`),
};

// Cashier API
export const cashierAPI = {
  create: (cashierData) => api.post('/cashiers', cashierData),
  getAll: () => api.get('/cashiers'),
  getById: (id) => api.get(`/cashiers/${id}`),
  update: (id, cashierData) => api.put(`/cashiers/${id}`, cashierData),
  delete: (id) => api.delete(`/cashiers/${id}`),
  getByShop: (shopId) => api.get(`/cashiers/shop/${shopId}`),
  assignToShop: (cashierId, shopId) => 
    api.patch(`/cashiers/${cashierId}/assign`, { shopId }),
};

// Inventory API
export const inventoryAPI = {
  create: (itemData) => api.post('/inventory', itemData),
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  update: (id, itemData) => api.put(`/inventory/${id}`, itemData),
  delete: (id) => api.delete(`/inventory/${id}`),
  getByShop: (shopId) => api.get(`/inventory/shop/${shopId}`),
  updateStock: (id, quantity) => 
    api.patch(`/inventory/${id}/stock`, { quantity }),
  getLowStock: (shopId) => api.get(`/inventory/low-stock/${shopId}`),
};

// Transaction API
export const transactionAPI = {
  create: (transactionData) => api.post('/transactions', transactionData),
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  getByShop: (shopId) => api.get(`/transactions/shop/${shopId}`),
  getByVendor: (vendorId) => api.get(`/transactions/vendor/${vendorId}`),
  getStats: (shopId, period) => api.get(`/transactions/stats/${shopId}?period=${period}`),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api; 