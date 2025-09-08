import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export function useAuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, needsEmployeeSelection } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSelectEmployee = segments.join('/') === '(auth)/select-employee';

    console.log('🔀 Auth Redirect Check:', {
      isAuthenticated,
      needsEmployeeSelection,
      inAuthGroup,
      inTabsGroup,
      inSelectEmployee,
      segments
    });

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth screens, redirect to login
      console.log('🔀 Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && needsEmployeeSelection && !inSelectEmployee) {
      // User is authenticated but needs to select employee
      console.log('🔀 Redirecting to employee selection...');
      router.replace('/(auth)/select-employee');
    } else if (isAuthenticated && !needsEmployeeSelection && inAuthGroup && !inSelectEmployee) {
      // User is authenticated with employee selected but in auth screens
      console.log('🔀 Redirecting to tabs...');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, needsEmployeeSelection, segments]);
}