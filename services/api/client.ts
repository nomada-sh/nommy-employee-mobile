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
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add employee header if available
      const employeeId = await SecureStore.getItemAsync('employeeId');
      if (employeeId) {
        config.headers.Employee = employeeId;
      }

      // Add device token if available (for push notifications)
      const deviceToken = await SecureStore.getItemAsync('deviceToken');
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
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userId');
      await SecureStore.deleteItemAsync('employeeId');
      
      // The auth store will handle the redirect to login
      // when it detects the token is gone
    }

    return Promise.reject(error);
  }
);