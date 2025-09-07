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
          if (credentials.email === 'test@nommy.app' && credentials.password === 'password') {
            const mockResponse: LoginResponse = {
              user: {
                id: '1',
                email: credentials.email,
                name: 'John Doe',
                employeeId: 'EMP001',
                department: 'Engineering',
                position: 'Senior Developer',
              },
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