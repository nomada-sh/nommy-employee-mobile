import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function RequestsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: Platform.OS === 'ios',
        headerLargeTitleStyle: {
          color: colors.text,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.tint,
        headerShadowVisible: false,
        headerBlurEffect: colorScheme === 'dark' ? 'dark' : 'light',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Requests',
          headerLargeTitle: true,
        }} 
      />
    </Stack>
  );
}