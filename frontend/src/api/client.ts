import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, removeToken } from '../utils/storage';

// API URL: use Railway production for web deployments, localhost for dev
const PRODUCTION_API = 'https://ncert-quiz-production.up.railway.app/api/v1';
const DEV_API = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

// On web, detect if we're on localhost (dev) or deployed (prod)
const isWebProd = Platform.OS === 'web' && typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const API_URL = isWebProd ? PRODUCTION_API : DEV_API;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken('accessToken');
    }
    return Promise.reject(error);
  }
);
