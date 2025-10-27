import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/ToastConfig";
import "../global.css";
import { useAuthStore } from "../store/useAuthStore";

// Disable strict mode warnings for Reanimated
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (error: any) {
        if (error?.message === "DEVICE_CHANGED") {
          // Show toast notification for device change
          setTimeout(() => {
            Toast.show({
              type: "error",
              text1: "Session Expired",
              text2: "You have been logged in on another device",
              visibilityTime: 5000,
            });
          }, 1000);
        }
      }
    };
    init();
  }, [initialize]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="current-user" options={{ gestureEnabled: false }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </>
  );
}
