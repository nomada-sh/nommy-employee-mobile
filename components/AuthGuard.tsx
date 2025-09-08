import React, { useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!navigationState?.key) return; // Wait for navigation to be ready
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🔀 Auth Guard Check:', {
      isAuthenticated,
      inAuthGroup,
      inTabsGroup,
      segments,
      navReady: !!navigationState?.key
    });

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth screens, redirect to login
      console.log('🔀 Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth screens, redirect to tabs
      console.log('🔀 Redirecting to tabs...');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key]);

  return <>{children}</>;
}