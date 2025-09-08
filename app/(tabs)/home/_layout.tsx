import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function HomeLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerLargeTitleStyle: {
          color: colors.text,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerLargeTitle: true,
        headerTintColor: colors.tint,
        headerShadowVisible: false,
        headerBlurEffect:
          Platform.OS === "ios"
            ? colorScheme === "dark"
              ? "dark"
              : "light"
            : undefined,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          title: "Nommy",
        }}
      />
    </Stack>
  );
}
