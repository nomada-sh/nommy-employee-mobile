import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
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
      return await getItemAsync(name);
    } catch (error) {
      console.error('Error getting item from secure store:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await setItemAsync(name, value);
    } catch (error) {
      console.error('Error setting item in secure store:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await deleteItemAsync(name);
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
      isLoading: false,
      biometricEnabled: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          // Mock users for development
          // TODO: Replace with actual API call using TanStack Query mutation
          const mockUsers = [
            {
              email: 'juan.perez@nommy.app',
              password: 'password123',
              user: { id: '1', email: 'juan.perez@nommy.app', name: 'Juan Pérez', employeeId: 'EMP001' }
            },
            {
              email: 'maria.garcia@nommy.app',
              password: 'password123',
              user: { id: '2', email: 'maria.garcia@nommy.app', name: 'María García', employeeId: 'EMP002' }
            },
            {
              email: 'carlos.lopez@nommy.app',
              password: 'password123',
              user: { id: '3', email: 'carlos.lopez@nommy.app', name: 'Carlos López', employeeId: 'EMP003' }
            },
            {
              email: 'ana.martinez@nommy.app',
              password: 'password123',
              user: { id: '4', email: 'ana.martinez@nommy.app', name: 'Ana Martínez', employeeId: 'EMP004' }
            },
            {
              email: 'test@nommy.app',
              password: 'password',
              user: { id: '5', email: 'test@nommy.app', name: 'Usuario de Prueba', employeeId: 'EMP005' }
            }
          ];

          const mockUser = mockUsers.find(u => 
            u.email === credentials.email && u.password === credentials.password
          );

          if (mockUser) {
            
            // Store tokens securely
            await setItemAsync('access_token', 'mock_jwt_token');
            await setItemAsync('refresh_token', 'mock_refresh_token');
            
            set({ 
              user: mockUser.user, 
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
        console.log('🚪 Starting logout...');
        
        // Clear auth state immediately
        set({ 
          user: null, 
          isAuthenticated: false, 
          biometricEnabled: false,
          isLoading: false
        });
        
        // Clear secure storage asynchronously (don't wait)
        Promise.all([
          deleteItemAsync('access_token').catch(() => {}),
          deleteItemAsync('refresh_token').catch(() => {}),
          deleteItemAsync('biometric_credentials').catch(() => {})
        ]).then(() => {
          console.log('🚪 Secure storage cleared');
        });
        
        console.log('🚪 Logout state updated');
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
              await setItemAsync(
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
          await deleteItemAsync('biometric_credentials');
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
        biometricEnabled: state.biometricEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set isAuthenticated based on whether user exists
          state.isAuthenticated = !!state.user;
          console.log('🔄 Rehydrated auth state:', { 
            hasUser: !!state.user, 
            isAuthenticated: state.isAuthenticated 
          });
        }
      },
    }
  )
);