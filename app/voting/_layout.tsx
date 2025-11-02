import { Stack } from "expo-router";

export default function VotingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="session-detail" options={{gestureEnabled: true}}/>
      <Stack.Screen name="session-voting" options={{gestureEnabled: true}}/>
      <Stack.Screen name="candidate-detail" options={{gestureEnabled: true}}/>
      <Stack.Screen name="vote-confirmation" options={{gestureEnabled: true}}/>
      <Stack.Screen name="live-results" options={{gestureEnabled: true}}/>
      <Stack.Screen name="final-results" options={{gestureEnabled: true}}/>
    </Stack>
  );
}
