import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';

// Types
export interface Employee {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  foto?: string;
  activo: boolean;
  fecha_ingreso?: string;
  departamento?: string;
  puesto?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
  employees: Employee[];
  employee: Employee | null;
}

export interface SignInResponse {
  token: string;
  user: User;
}

export interface SignInParams {
  email: string;
  password: string;
}

// Authentication service
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(params: SignInParams): Promise<SignInResponse> {
    try {
      const response = await apiClient.post<SignInResponse>('/auth/employee/sign-in', params);
      
      // Validate that user has employees
      if (!response.data.user.employees.length) {
        throw new Error('Acceso limitado a empleados');
      }

      // Store token and user data
      await SecureStore.setItemAsync('authToken', response.data.token);
      await SecureStore.setItemAsync('userId', response.data.user.id.toString());
      
      // Store the first employee ID as the default
      if (response.data.user.employees.length > 0) {
        await SecureStore.setItemAsync('employeeId', response.data.user.employees[0].id.toString());
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error al iniciar sesión');
      }
    }
  },

  /**
   * Sign out and clear stored credentials
   */
  async signOut(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('employeeId');
    await SecureStore.deleteItemAsync('deviceToken');
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('authToken');
    return !!token;
  },

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh');
      const newToken = response.data.token;
      
      await SecureStore.setItemAsync('authToken', newToken);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  },
};