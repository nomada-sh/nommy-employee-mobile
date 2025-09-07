import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  employeeId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

// Secure storage implementation
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('Error getting item from secure store:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Error setting item in secure store:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Error removing item from secure store:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      biometricEnabled: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          // Mock login for development
          // TODO: Replace with actual API call using TanStack Query mutation
          if (credentials.email === 'test@nommy.app' && credentials.password === 'password') {
            const mockUser: User = {
              id: '1',
              email: credentials.email,
              name: 'John Doe',
              employeeId: 'EMP001',
            };
            
            // Store tokens securely
            await SecureStore.setItemAsync('access_token', 'mock_jwt_token');
            await SecureStore.setItemAsync('refresh_token', 'mock_refresh_token');
            
            set({ 
              user: mockUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Clear secure storage
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          await SecureStore.deleteItemAsync('biometric_credentials');
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            biometricEnabled: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      enableBiometric: async () => {
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (!hasHardware || !isEnrolled) {
            throw new Error('Biometric authentication not available');
          }

          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Enable biometric authentication',
            disableDeviceFallback: true,
          });

          if (result.success) {
            const { user } = get();
            if (user) {
              await SecureStore.setItemAsync(
                'biometric_credentials', 
                JSON.stringify({ userId: user.id, enabled: true })
              );
              set({ biometricEnabled: true });
            }
          }
        } catch (error) {
          console.error('Enable biometric error:', error);
          throw error;
        }
      },

      disableBiometric: async () => {
        try {
          await SecureStore.deleteItemAsync('biometric_credentials');
          set({ biometricEnabled: false });
        } catch (error) {
          console.error('Disable biometric error:', error);
        }
      },

      authenticateWithBiometric: async (): Promise<boolean> => {
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (!hasHardware || !isEnrolled) {
            return false;
          }

          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate with biometric',
            disableDeviceFallback: true,
          });

          return result.success;
        } catch (error) {
          console.error('Biometric authentication error:', error);
          return false;
        }
      },

      setUser: (user: User) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
);