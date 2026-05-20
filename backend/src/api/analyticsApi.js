import axiosInstance from './axiosInstance';

export const trackCall = (producerId, deviceId) =>
  axiosInstance.post('/analytics/call', {producerId, deviceId});

export const trackAddressView = (producerId, deviceId) =>
  axiosInstance.post('/analytics/address', {producerId, deviceId});

export const getMyAnalytics = producerId =>
  axiosInstance.get(`/analytics/producer/${producerId}`);
