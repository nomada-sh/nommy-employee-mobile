import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get API URL from environment
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://app.nommy.mx/api';

console.log('📡 API URL:', API_URL);

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add employee header if available
      const employeeId = await SecureStore.getItemAsync('employee-id');
      if (employeeId) {
        config.headers.Employee = employeeId;
      }

      // Add device token if available (for push notifications)
      const deviceToken = await SecureStore.getItemAsync('device-token');
      if (deviceToken) {
        config.headers.DeviceToken = deviceToken;
      }
    } catch (error) {
      console.error('Error setting headers:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      await SecureStore.deleteItemAsync('auth-token');
      await SecureStore.deleteItemAsync('user-id');
      await SecureStore.deleteItemAsync('employee-id');
      
      // The auth store will handle the redirect to login
      // when it detects the token is gone
    }

    return Promise.reject(error);
  }
);