import { Stack } from "expo-router";

export default function CuisinesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,  // Hide the default header
      }}
    />
  );
}
