import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {'Content-Type': 'application/json'},
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error responses
api.interceptors.response.use(
  res => res,
  err => {
    let msg = 'An unexpected error occurred.';
    
    if (!err.response) {
      msg = 'Network Error: Cannot connect to the server. Please check if the backend is running.';
    } else {
      msg = err.response?.data?.message || err.response?.data?.error?.message || msg;
    }

    return Promise.reject({
      status: err.response?.status ?? 0,
      message: msg,
      fieldErrors: err.response?.data?.fieldErrors ?? {},
    });
  },
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const adminLogin = (data: { loginId: string; password: string }) =>
  api.post('/auth/login', data);

// ─── Producers ───────────────────────────────────────────────────────────────
export const getProducers = (params?: object) => api.get('/admin/producers', { params });
export const getProducerById = (id: string) => api.get(`/admin/producers/${id}`);
export const verifyProducer = (id: string) => api.put(`/admin/producers/${id}/verify`);
export const blockProducer = (id: string, reason: string) =>
  api.put(`/admin/producers/${id}/block`, { reason });
export const unblockProducer = (id: string) => api.put(`/admin/producers/${id}/unblock`);
export const deleteProducer = (id: string) => api.delete(`/admin/producers/${id}`);
export const getProducerLogs = (id: string) => api.get(`/admin/producers/${id}/audit-logs`);

// ─── Products ─────────────────────────────────────────────────────────────────
export const adminGetProducts = (params?: object) => api.get('/admin/products', { params });
export const suspendProduct = (id: string, reason: string) =>
  api.put(`/admin/products/${id}/suspend`, { reason });
export const activateProduct = (id: string) => api.put(`/admin/products/${id}/activate`);
export const adminDeleteProduct = (id: string) => api.delete(`/admin/products/${id}`);

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = () => api.get('/admin/categories');
export const createCategory = (name: string) => api.post('/admin/categories', { name });
export const updateCategory = (id: string, data: object) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/admin/categories/${id}`);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const getUserStats = () => api.get('/admin/reports/users');
export const getProductStats = () => api.get('/admin/reports/products');
export const getAnalyticsSummary = () => api.get('/admin/reports/analytics');

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (params?: object) => api.get('/admin/audit-logs', { params });

// ─── Announcements ────────────────────────────────────────────────────────────
export const sendAnnouncement = (data: object) => api.post('/admin/announcements', data);
