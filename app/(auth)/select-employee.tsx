import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Employee } from '@/services/api/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SelectEmployeeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, selectEmployee } = useAuthStore();
  
  const handleSelectEmployee = async (employee: Employee) => {
    try {
      await selectEmployee(employee);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el empleado');
    }
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const fullName = [item.name, item.firstLastName, item.secondLastName]
      .filter(Boolean)
      .join(' ');
    
    return (
      <TouchableOpacity
        style={[
          styles.employeeCard,
          {
            backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
          }
        ]}
        onPress={() => handleSelectEmployee(item)}
      >
        <View style={styles.employeeContent}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>
              {item.name?.charAt(0)?.toUpperCase() || 'E'}
            </ThemedText>
          </View>
          
          {/* Employee Info */}
          <View style={styles.employeeInfo}>
            <ThemedText style={styles.employeeName}>{fullName}</ThemedText>
            {item.tenant && (
              <ThemedText style={styles.tenantName}>
                <Ionicons name="business-outline" size={12} color={colors.icon} />
                {' '}{item.tenant.name}
              </ThemedText>
            )}
            {item.client && (
              <ThemedText style={styles.clientName}>
                <Ionicons name="briefcase-outline" size={12} color={colors.icon} />
                {' '}{item.client.businessName}
              </ThemedText>
            )}
            {item.balance !== undefined && (
              <ThemedText style={styles.balance}>
                Balance de vacaciones: {item.balance} días
              </ThemedText>
            )}
          </View>
          
          {/* Arrow */}
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Selecciona tu perfil</ThemedText>
          <ThemedText style={styles.subtitle}>
            Tienes acceso a múltiples organizaciones. Selecciona con cuál deseas trabajar.
          </ThemedText>
        </View>

        <FlatList
          data={user?.employees || []}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  listContent: {
    padding: 24,
    paddingTop: 8,
  },
  employeeCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  employeeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tenantName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 2,
  },
  balance: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  separator: {
    height: 12,
  },
});