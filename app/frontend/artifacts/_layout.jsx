import { Stack } from "expo-router";

export default function ArtifactsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,  // Hide the default header
      }}
    />
  );
}
