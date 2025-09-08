import React from "react";
import { DynamicColorIOS, Platform } from "react-native";
import {
  NativeTabs,
  Icon,
  Label,
  Badge,
} from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const tabColors = Platform.select({
    ios: {
      color: DynamicColorIOS({
        dark: Colors.dark.text,
        light: Colors.light.text,
      }),
      tintColor: DynamicColorIOS({
        dark: Colors.dark.tint,
        light: Colors.light.tint,
      }),
    },
    android: {
      color: Colors[colorScheme ?? "light"].text,
      tintColor: Colors[colorScheme ?? "light"].tint,
    },
    default: {
      color: Colors[colorScheme ?? "light"].text,
      tintColor: Colors[colorScheme ?? "light"].tint,
    },
  });

  return (
    <NativeTabs 
      style={tabColors}
      hapticFeedbackEnabled={true}
      translucent={Platform.OS === 'ios'}
      sidebar={Platform.OS === 'ios'}
      barTintColor={Platform.select({
        ios: DynamicColorIOS({
          dark: Colors.dark.background,
          light: Colors.light.background,
        }),
        default: Colors[colorScheme ?? "light"].background,
      })}
    >
      <NativeTabs.Trigger name="home">
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="ic_home"
        />
        <Label>Inicio</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="attendance">
        <Icon
          sf={{ default: "clock", selected: "clock.fill" }}
          drawable="ic_attendance"
        />
        <Label>Asistencia</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="requests">
        <Icon
          sf={{ default: "doc.text", selected: "doc.text.fill" }}
          drawable="ic_requests"
        />
        <Label>Solicitudes</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="benefits">
        <Icon
          sf={{ default: "gift", selected: "gift.fill" }}
          drawable="ic_benefits"
        />
        <Label>Beneficios</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
          drawable="ic_profile"
        />
        <Label>Perfil</Label>
      </NativeTabs.Trigger>

      {/* Hide old screens */}
      <NativeTabs.Trigger name="index" hidden />
      <NativeTabs.Trigger name="explore" hidden />
    </NativeTabs>
  );
}
