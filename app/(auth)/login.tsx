import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import * as LocalAuthentication from 'expo-local-authentication';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login, authenticateWithBiometric, biometricEnabled, isLoading, needsEmployeeSelection } = useAuthStore();
  
  const [email, setEmail] = useState('jose.vargas@intelamexico.com.mx');
  const [password, setPassword] = useState('jose.vargas@intelamexico.com.mx');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    try {
      await login({ email, password });
      
      // Check if user needs to select an employee/tenant
      const store = useAuthStore.getState();
      if (store.needsEmployeeSelection) {
        router.replace('/(auth)/select-employee');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      // Handle different error messages
      let errorMessage = 'Error al iniciar sesión. Por favor intente de nuevo.';
      
      if (err.message) {
        if (err.message.includes('Acceso limitado a empleados')) {
          errorMessage = 'Acceso limitado a empleados activos';
        } else if (err.message.includes('Invalid credentials') || err.message.includes('401')) {
          errorMessage = 'Credenciales inválidas. Por favor verifique su email y contraseña.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Por favor verifique su internet.';
        } else {
          errorMessage = err.message;
        }
      }
      
      Alert.alert('Error de inicio de sesión', errorMessage);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (err) {
      Alert.alert('Biometric Authentication Failed', 'Please try again or use password.');
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return hasHardware && isEnrolled && supportedTypes.length > 0;
    } catch (err) {
      console.error('Biometric availability check failed:', err);
      return false;
    }
  };

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.spacer} />
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Bienvenido a Nommy</ThemedText>
              <ThemedText style={styles.subtitle}>Inicia sesión en tu cuenta de empleado</ThemedText>
            </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Correo electrónico</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
                    color: colors.text,
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Ingresa tu correo electrónico"
                placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Contraseña</ThemedText>
              <View style={[
                styles.passwordContainer,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
                }
              ]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <ThemedText style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: colors.tint }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <ThemedText style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </ThemedText>
            </TouchableOpacity>

            {biometricEnabled && (
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.biometricButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
                  }
                ]}
                onPress={handleBiometricLogin}
              >
                <ThemedText style={[styles.biometricButtonText, { color: colors.tint }]}>
                  🔐 Usar Autenticación Biométrica
                </ThemedText>
              </TouchableOpacity>
            )}
            </View>
          </View>
          <View style={styles.spacer} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  formContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  eyeText: {
    fontSize: 18,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {},
  biometricButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});