import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { User, LoginCredentials, LoginResponse } from '@/types/auth';

// API Base URL (should be in environment variables)
const API_BASE_URL = 'https://api.nommy.app/v1';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// API Functions
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('access_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, should trigger logout
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      throw new Error('Unauthorized');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Query Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: (): Promise<User> => apiRequest('/auth/me'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message === 'Unauthorized') return false;
      return failureCount < 2;
    },
  });
};

// Mutation Hooks
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      // Mock API call for development
      // TODO: Replace with actual API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockUsers = [
            {
              email: 'juan.perez@nommy.app',
              password: 'password123',
              user: { 
                id: '1', 
                email: 'juan.perez@nommy.app', 
                name: 'Juan Pérez', 
                employeeId: 'EMP001',
                department: 'Recursos Humanos',
                position: 'Gerente de RRHH'
              }
            },
            {
              email: 'maria.garcia@nommy.app',
              password: 'password123',
              user: { 
                id: '2', 
                email: 'maria.garcia@nommy.app', 
                name: 'María García', 
                employeeId: 'EMP002',
                department: 'Tecnología',
                position: 'Desarrolladora Senior'
              }
            },
            {
              email: 'carlos.lopez@nommy.app',
              password: 'password123',
              user: { 
                id: '3', 
                email: 'carlos.lopez@nommy.app', 
                name: 'Carlos López', 
                employeeId: 'EMP003',
                department: 'Ventas',
                position: 'Ejecutivo de Ventas'
              }
            },
            {
              email: 'ana.martinez@nommy.app',
              password: 'password123',
              user: { 
                id: '4', 
                email: 'ana.martinez@nommy.app', 
                name: 'Ana Martínez', 
                employeeId: 'EMP004',
                department: 'Marketing',
                position: 'Coordinadora de Marketing'
              }
            },
            {
              email: 'test@nommy.app',
              password: 'password',
              user: { 
                id: '5', 
                email: 'test@nommy.app', 
                name: 'Usuario de Prueba', 
                employeeId: 'EMP005',
                department: 'Desarrollo',
                position: 'Tester'
              }
            }
          ];

          const mockUser = mockUsers.find(u => 
            u.email === credentials.email && u.password === credentials.password
          );

          if (mockUser) {
            const mockResponse: LoginResponse = {
              user: mockUser.user,
              token: 'mock_jwt_token',
              refreshToken: 'mock_refresh_token',
            };
            resolve(mockResponse);
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 1000);
      });
    },
    onSuccess: (data) => {
      // Cache the user data
      queryClient.setQueryData(authKeys.currentUser(), data.user);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Call logout API if needed
      // await apiRequest('/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>): Promise<User> => {
      return apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },
    onSuccess: (updatedUser) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.currentUser(), updatedUser);
    },
  });
};