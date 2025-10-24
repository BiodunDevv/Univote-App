import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="signin" options={{ gestureEnabled: true }} />
      <Stack.Screen
        name="create-password"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
