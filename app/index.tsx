import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Debug auth state changes
  useEffect(() => {
    console.log('🔐 Auth State Changed:', { 
      isAuthenticated, 
      isLoading, 
      user: user?.name 
    });
  }, [isAuthenticated, isLoading, user]);

  console.log('🏠 Index render:', { isAuthenticated, isLoading });

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}