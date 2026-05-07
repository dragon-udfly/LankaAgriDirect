import axiosInstance from './axiosInstance';

export const registerProducer = data =>
  axiosInstance.post('/auth/register/producer', data);

export const registerAdmin = data =>
  axiosInstance.post('/auth/register/admin', data);

export const login = data => axiosInstance.post('/auth/login', data);

export const getMe = () => axiosInstance.get('/auth/me');

export const updateProfile = data => axiosInstance.put('/auth/profile', data);

export const deleteAccount = () => axiosInstance.delete('/auth/profile');
