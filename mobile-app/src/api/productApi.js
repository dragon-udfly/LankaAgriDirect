import axiosInstance from './axiosInstance';

export const getAllProducts = params =>
  axiosInstance.get('/products', {params});

export const getProductById = id => axiosInstance.get(`/products/${id}`);

export const createProduct = data => axiosInstance.post('/products', data);

export const updateProduct = (id, data) =>
  axiosInstance.put(`/products/${id}`, data);

export const toggleSoldOut = (id, isSoldOut) =>
  axiosInstance.put(`/products/${id}/sold-out`, {isSoldOut});

export const deleteProduct = id => axiosInstance.delete(`/products/${id}`);
