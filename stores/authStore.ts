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
  // Selected employee/tenant info
  selectedEmployee?: Employee;
  selectedTenantId?: number;
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
  needsEmployeeSelection: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  selectEmployee: (employee: Employee) => Promise<void>;
  changeEmployee: () => void;
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
      needsEmployeeSelection: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          // Call the real API
          const response = await authService.signIn(credentials);
          
          // Check if user has multiple employees/tenants
          const hasMultipleEmployees = response.user.employees.length > 1;
          
          // Try to get saved employee selection
          const savedEmployeeId = await getItemAsync(`selectedEmployee_${response.user.id}`);
          let selectedEmployee = null;
          
          if (savedEmployeeId) {
            // Find the saved employee in the list
            selectedEmployee = response.user.employees.find(
              emp => emp.id.toString() === savedEmployeeId
            );
          }
          
          // If no saved selection or saved employee not found, and has multiple employees
          // We need to show the selection screen
          const needsSelection = hasMultipleEmployees && !selectedEmployee;
          
          // If only one employee or has valid saved selection, auto-select
          if (!needsSelection) {
            selectedEmployee = selectedEmployee || response.user.employees[0];
          }
          
          // Transform API user to our User type
          const user: User = {
            id: response.user.id.toString(),
            email: response.user.email,
            name: response.user.username,
            employeeId: selectedEmployee?.id.toString() || '',
            employees: response.user.employees,
            role: response.user.role,
            profilePicture: selectedEmployee?.profilePicture?.url || response.user.employees[0]?.profilePicture?.url,
            selectedEmployee: selectedEmployee || undefined,
            selectedTenantId: selectedEmployee?.tenant?.id,
          };
          
          // Update store with user data
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            needsEmployeeSelection: needsSelection
          });
          
          console.log('✅ Login successful:', user.email);
          console.log('📋 Needs employee selection:', needsSelection);
        } catch (error: any) {
          set({ isLoading: false });
          console.error('❌ Login error:', error.message);
          throw error;
        }
      },

      selectEmployee: async (employee: Employee) => {
        const { user } = get();
        if (!user) return;
        
        try {
          // Save the selected employee ID
          await setItemAsync(`selectedEmployee_${user.id}`, employee.id.toString());
          
          // Update user with selected employee
          const updatedUser: User = {
            ...user,
            employeeId: employee.id.toString(),
            selectedEmployee: employee,
            selectedTenantId: employee.tenant?.id,
            profilePicture: employee.profilePicture?.url || user.profilePicture,
          };
          
          // Update store
          set({
            user: updatedUser,
            needsEmployeeSelection: false,
          });
          
          console.log('✅ Employee selected:', employee.name, '- Tenant:', employee.tenant?.name);
        } catch (error) {
          console.error('❌ Error selecting employee:', error);
        }
      },
      
      changeEmployee: () => {
        // Show the employee selection screen again
        set({ needsEmployeeSelection: true });
      },

      logout: async () => {
        console.log('🚪 Starting logout...');
        
        // Clear auth state immediately
        set({ 
          user: null, 
          isAuthenticated: false, 
          biometricEnabled: false,
          isLoading: false,
          needsEmployeeSelection: false
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