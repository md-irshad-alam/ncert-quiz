import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, removeToken } from '../utils/storage';

// Base API URL (update with your local IP or production URL)
// For Android emulator 10.0.2.2 usually maps to localhost. For iOS emulator, localhost works.
// Using a generic variable to allow easy switching.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

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
      // Clear token and handle unauthorized state
      await removeToken('accessToken');
      // Typically you would dispatch an event or use a global navigation ref to redirect to Login
    }
    return Promise.reject(error);
  }
);
