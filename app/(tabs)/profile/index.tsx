import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout, biometricEnabled, enableBiometric, disableBiometric } = useAuthStore();

  const handleBiometricToggle = async () => {
    try {
      if (biometricEnabled) {
        await disableBiometric();
      } else {
        await enableBiometric();
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
    }
  };

  const settingsItems = [
    {
      icon: 'person-outline',
      title: 'Editar Perfil',
      subtitle: 'Actualiza tu información personal',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notificaciones',
      subtitle: 'Administra tus preferencias de notificación',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Autenticación Biométrica',
      subtitle: biometricEnabled ? 'Habilitada' : 'Deshabilitada',
      onPress: handleBiometricToggle,
    },
    {
      icon: 'language-outline',
      title: 'Idioma',
      subtitle: 'Español',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Ayuda y Soporte',
      subtitle: 'Obtén ayuda y contacta soporte',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView 
      style={styles.scrollView}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <ThemedView style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </ThemedText>
        </View>
        <ThemedText style={styles.userName}>{user?.name || 'Nombre de Usuario'}</ThemedText>
        <ThemedText style={styles.userEmail}>{user?.email || 'usuario@empresa.com'}</ThemedText>
        <ThemedText style={styles.employeeId}>ID: {user?.employeeId || 'EMP001'}</ThemedText>
      </ThemedView>

      {/* Settings List */}
      <ThemedView style={styles.settingsContainer}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingsItem,
              { borderBottomColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6' }
            ]}
            onPress={item.onPress}
          >
            <View style={styles.settingsIcon}>
              <Ionicons name={item.icon as any} size={24} color={colors.icon} />
            </View>
            <View style={styles.settingsContent}>
              <ThemedText style={styles.settingsTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.settingsSubtitle}>{item.subtitle}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Logout Button */}
      <ThemedView style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <ThemedText style={styles.versionText}>Versión 1.1.0</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 14,
    opacity: 0.5,
  },
  settingsContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
});