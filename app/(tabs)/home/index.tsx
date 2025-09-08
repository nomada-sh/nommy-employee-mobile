import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Good morning,</ThemedText>
          <ThemedText style={styles.userName}>
            {user?.name || "Employee"}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <ThemedView
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1e3a8a" : "#dbeafe",
                },
              ]}
            >
              <Ionicons name="time" size={24} color="#3b82f6" />
            </ThemedView>
            <ThemedText style={styles.actionText}>Check In</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <ThemedView
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#78350f" : "#fef3c7",
                },
              ]}
            >
              <Ionicons name="document-text" size={24} color="#f59e0b" />
            </ThemedView>
            <ThemedText style={styles.actionText}>New Request</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <ThemedView
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#14532d" : "#dcfce7",
                },
              ]}
            >
              <Ionicons name="gift" size={24} color="#22c55e" />
            </ThemedView>
            <ThemedText style={styles.actionText}>Benefits</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Overview */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Today&apos;s Overview
        </ThemedText>
        <ThemedView style={styles.overviewCard}>
          <View style={styles.overviewItem}>
            <ThemedText style={styles.overviewValue}>8h 30m</ThemedText>
            <ThemedText style={styles.overviewLabel}>Worked Today</ThemedText>
          </View>
          <View
            style={[
              styles.overviewDivider,
              {
                backgroundColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
              },
            ]}
          />
          <View style={styles.overviewItem}>
            <ThemedText style={styles.overviewValue}>2</ThemedText>
            <ThemedText style={styles.overviewLabel}>
              Pending Requests
            </ThemedText>
          </View>
          <View
            style={[
              styles.overviewDivider,
              {
                backgroundColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
              },
            ]}
          />
          <View style={styles.overviewItem}>
            <ThemedText style={styles.overviewValue}>5</ThemedText>
            <ThemedText style={styles.overviewLabel}>Days Left</ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <ThemedView style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View
              style={[
                styles.activityIcon,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1e3a8a" : "#dbeafe",
                },
              ]}
            >
              <Ionicons name="checkmark" size={16} color="#3b82f6" />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>
                Check-in completed
              </ThemedText>
              <ThemedText style={styles.activityTime}>2 hours ago</ThemedText>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View
              style={[
                styles.activityIcon,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#78350f" : "#fef3c7",
                },
              ]}
            >
              <Ionicons name="calendar" size={16} color="#f59e0b" />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>
                Vacation request approved
              </ThemedText>
              <ThemedText style={styles.activityTime}>1 day ago</ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>

      {/* Extra content to test scroll */}
      <View style={{ height: 200 }} />
      <ThemedText style={{ textAlign: "center", opacity: 0.5 }}>
        Scroll up to see the Large Title animation
      </ThemedText>
      <View style={{ height: 200 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: "center",
  },
  overviewCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  overviewDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.6,
  },
});
