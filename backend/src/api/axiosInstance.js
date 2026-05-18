import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080/api/v1' 
  : 'http://10.0.2.2:8080/api/v1'; // 10.0.2.2 routes to localhost on Android emulator

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token if available
axiosInstance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor — normalize error messages
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const {data, status} = error.response;
      const message =
        data?.message || data?.error?.message || 'An error occurred.';
      const code = data?.code || 'ERROR';
      return Promise.reject({status, message, code, fieldErrors: data?.fieldErrors});
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    }
    return Promise.reject({status: 0, message: error.message, code: 'UNKNOWN'});
  },
);

export default axiosInstance;
