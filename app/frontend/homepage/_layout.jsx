import { Tabs } from 'expo-router';
import Navbar from '../components/navbar';

export default function HomeLayout() {
  return (
    <Tabs
      tabBar={(props) => <Navbar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* 1. Home */}
      <Tabs.Screen name="home" options={{ title: 'Home' }} />

      {/* 2. AR Scan */}
      <Tabs.Screen name="ar_scan" options={{ title: 'AR Scan' }} />

      {/* 3. AR Mode (The Middle Button) */}
      <Tabs.Screen name="ar_mode" options={{ title: 'AR Mode' }} />

      {/* 4. Map */}
      <Tabs.Screen name="map" options={{ title: 'Map' }} />

      {/* 5. Saved */}
      <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
    </Tabs>
  );
}