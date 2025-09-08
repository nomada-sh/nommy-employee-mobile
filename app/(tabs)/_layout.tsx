import React from "react";
import { DynamicColorIOS, Platform } from "react-native";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={Platform.select({
        ios: DynamicColorIOS({
          dark: Colors.dark.tabIconSelected,
          light: Colors.light.tabIconSelected,
        }),
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
