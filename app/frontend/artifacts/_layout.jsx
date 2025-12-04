import { Stack } from "expo-router";
import { SavedItemsProvider } from '../components/SavedItemsContext';

export default function ArtifactsLayout() {
  return (
    <SavedItemsProvider>
      <Stack
        screenOptions={{
          headerShown: false,  // Hide the default header
        }}
      />
    </SavedItemsProvider>
  );
}
