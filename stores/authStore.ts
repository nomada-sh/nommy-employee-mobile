import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { authService, User as ApiUser, Employee } from '@/services/api/auth';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  employeeId: string;
  employees?: Employee[];
  role?: {
    id: number;
    name: string;
    description?: string;
  };
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
          
          // Call the real API
          const response = await authService.signIn(credentials);
          
          // Transform API user to our User type
          const user: User = {
            id: response.user.id.toString(),
            email: response.user.email,
            name: response.user.username,
            employeeId: response.user.employees[0]?.id.toString() || '',
            employees: response.user.employees,
            role: response.user.role,
            profilePicture: response.user.employees[0]?.foto,
          };
          
          // Update store with user data
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          console.log('✅ Login successful:', user.email);
        } catch (error: any) {
          set({ isLoading: false });
          console.error('❌ Login error:', error.message);
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
        
        // Clear all stored data using auth service
        await authService.signOut();
        
        // Also clear biometric credentials
        await deleteItemAsync('biometric_credentials').catch(() => {});
        
        console.log('🚪 Logout complete');
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