import { Stack } from 'expo-router';

export default function MPracaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="candidate" />
      <Stack.Screen name="employer" />
      <Stack.Screen name="bezrobotny" />
    </Stack>
  );
}
