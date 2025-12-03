import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* 'index' refers to index.jsx, which will be our Login screen */}
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}