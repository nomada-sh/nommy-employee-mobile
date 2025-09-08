import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { authService, User as ApiUser, Employee } from '@/services/api/auth';
import { Platform, Alert } from 'react-native';

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
  needsEmployeeSelection: boolean;
  
  // Biometric states (mirrors legacy app)
  biometricEnabled: boolean;
  rememberPassword: boolean;
  showPasswordInput: boolean;
  savedPassword: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  selectEmployee: (employee: Employee) => Promise<void>;
  changeEmployee: () => void;
  
  // Biometric actions (replicating legacy)
  authenticateWithBiometric: () => Promise<boolean>;
  handleSignInSuccess: (email: string, password: string) => Promise<void>;
  loadEmailPreferences: (email: string) => Promise<void>;
  toggleRememberPassword: () => void;
  
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

// Legacy storage functions (matching payjob-mobile-old)
const setToken = async (token: string) => {
  return setItemAsync('auth-token', token);
};

const getToken = async () => {
  const tokenResult = await getItemAsync('auth-token');
  return tokenResult;
};

const setUserId = async (id: string) => {
  return setItemAsync('user-id', id);
};

const setEmployee = async (employeeId: string | number) => {
  return setItemAsync('employee-id', employeeId.toString());
};

const getEmployee = async () => {
  const employeeResult = await getItemAsync('employee-id');
  return employeeResult;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      needsEmployeeSelection: false,
      biometricEnabled: false,
      rememberPassword: true,
      showPasswordInput: true,
      savedPassword: null,

      loadEmailPreferences: async (email: string) => {
        try {
          // Load preferences for this specific email (matching legacy pattern)
          const biometricChoice = await AsyncStorage.getItem(`biometric-choice-${email}`);
          const biometricEnabled = await AsyncStorage.getItem(`biometric-${email}`);
          const rememberChoice = await AsyncStorage.getItem(`remember-${email}`);
          const savedPassword = await AsyncStorage.getItem(`password-${email}`);
          
          const isBiometricEnabled = biometricEnabled === 'true';
          const shouldRemember = rememberChoice === null ? true : rememberChoice === 'true';
          const shouldShowPasswordInput = !(isBiometricEnabled && savedPassword);
          
          set({
            biometricEnabled: isBiometricEnabled,
            rememberPassword: shouldRemember,
            savedPassword: savedPassword,
            showPasswordInput: shouldShowPasswordInput,
          });
          
          console.log('📧 Loaded preferences for email:', email, {
            biometricChoice,
            biometricEnabled: isBiometricEnabled,
            rememberChoice: shouldRemember,
            hasPassword: !!savedPassword,
            showPasswordInput: shouldShowPasswordInput,
          });
          
        } catch (error) {
          console.error('Error loading email preferences:', error);
        }
      },

      handleSignInSuccess: async (email: string, password: string) => {
        try {
          // Save last used email
          await AsyncStorage.setItem('last-email', email);

          // Handle remember password
          const { rememberPassword } = get();
          if (rememberPassword) {
            await AsyncStorage.setItem(`remember-${email}`, 'true');
          } else {
            await AsyncStorage.setItem(`remember-${email}`, 'false');
          }

          // Check biometric choice - this is the critical legacy logic
          const choice = await AsyncStorage.getItem(`biometric-choice-${email}`);

          if (choice === 'accepted') {
            // User previously accepted biometrics
            await AsyncStorage.setItem(`biometric-${email}`, 'true');
            await AsyncStorage.setItem(`password-${email}`, password);
            return;
          }

          if (choice === 'rejected') {
            // User previously rejected biometrics
            await AsyncStorage.removeItem(`biometric-${email}`);
            if (rememberPassword) {
              await AsyncStorage.setItem(`password-${email}`, password);
            } else {
              await AsyncStorage.removeItem(`password-${email}`);
            }
            return;
          }

          // First time - ask user about biometrics
          Alert.alert(
            'Iniciar sesión',
            '¿Quieres guardar tus datos biométricos para iniciar sesión más rápido?',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: async () => {
                  await AsyncStorage.setItem(`biometric-choice-${email}`, 'rejected');
                  await AsyncStorage.removeItem(`biometric-${email}`);
                  if (rememberPassword) {
                    await AsyncStorage.setItem(`password-${email}`, password);
                  } else {
                    await AsyncStorage.removeItem(`password-${email}`);
                  }
                  
                  // Update store state immediately
                  set({
                    biometricEnabled: false,
                    savedPassword: rememberPassword ? password : null,
                    showPasswordInput: true,
                  });
                },
              },
              {
                text: 'Guardar',
                onPress: async () => {
                  await AsyncStorage.setItem(`biometric-choice-${email}`, 'accepted');
                  await AsyncStorage.setItem(`biometric-${email}`, 'true');
                  await AsyncStorage.setItem(`password-${email}`, password);
                  
                  // Update store state immediately
                  set({
                    biometricEnabled: true,
                    savedPassword: password,
                    showPasswordInput: false,
                  });
                },
              },
            ]
          );
        } catch (error) {
          console.error('Error in handleSignInSuccess:', error);
        }
      },

      authenticateWithBiometric: async (): Promise<boolean> => {
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (!hasHardware || !isEnrolled) {
            return false;
          }

          // Use Expo's LocalAuthentication
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autentícate para continuar',
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar contraseña',
          });
          
          return result.success;
        } catch (error) {
          console.error('Biometric authentication error:', error);
          return false;
        }
      },

      toggleRememberPassword: () => {
        const { rememberPassword, savedPassword, user } = get();
        const newRememberValue = !rememberPassword;
        
        set({ rememberPassword: newRememberValue });
        
        // If disabling remember, clear saved password from input
        // If enabling remember and we have a saved password, populate it
        if (!newRememberValue) {
          // User disabled remember - don't show password in input
        } else if (savedPassword) {
          // User enabled remember and we have a saved password
        }
      },

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          const { biometricEnabled, showPasswordInput, savedPassword } = get();
          
          // If using biometrics and no password input, authenticate first
          if (biometricEnabled && !showPasswordInput && savedPassword) {
            const authenticated = await get().authenticateWithBiometric();
            
            if (authenticated) {
              // Use saved password for API call
              credentials.password = savedPassword;
            } else {
              // Biometric failed, show password input
              set({ showPasswordInput: true, isLoading: false });
              return;
            }
          }
          
          // Call the real API
          const response = await authService.signIn(credentials);
          
          // Save authentication tokens (legacy format)
          await setToken(response.token);
          await setUserId(response.user.id.toString());
          
          // Try to get saved employee selection
          const savedEmployeeId = await getEmployee();
          let selectedEmployee = null;
          
          if (savedEmployeeId) {
            // Find the saved employee in the list
            selectedEmployee = response.user.employees.find(
              emp => emp.id.toString() === savedEmployeeId
            );
          }
          
          // ALWAYS show selection screen if no saved selection or saved employee not found
          const needsSelection = !selectedEmployee;
          
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
          
          // Handle post-login success logic
          await get().handleSignInSuccess(credentials.email, credentials.password);
          
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
          // Save the selected employee ID (legacy format)
          await setEmployee(employee.id.toString());
          
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
          isLoading: false,
          needsEmployeeSelection: false,
          biometricEnabled: false,
          rememberPassword: true,
          showPasswordInput: true,
          savedPassword: null,
        });
        
        // Clear all stored data using auth service
        await authService.signOut();
        
        console.log('🚪 Logout complete');
      },

      setUser: (user: User) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
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