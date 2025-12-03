import { Stack } from "expo-router";
import { SavedItemsProvider } from '../components/SavedItemsContext';

export default function CulturalSitesLayout() {
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
