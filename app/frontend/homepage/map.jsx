import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker, Callout, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../../lib/database/supabase';

// --- MAPBOX CONFIGURATION ---
// 1. Put your Public Access Token here
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2FudGlsbGFuamIwMzMiLCJhIjoiY21oMHAyeXBwMDF6OTJrcXpyZ3B6MXo3byJ9.HyebjVUxFqknP0lGm6arvg"; 

// 2. Choose your style (Streets, Outdoors, Light, Dark, Satellite)
// Common styles: 'streets-v12', 'outdoors-v12', 'light-v11', 'dark-v11', 'satellite-v9'
const MAPBOX_STYLE_ID = "outdoors-v12"; 
const MAPBOX_USERNAME = "mapbox";

// 3. Construct the Tile URL
const MAPBOX_URL_TEMPLATE = `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to see nearby sites.');
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      fetchSites();
    })();
  }, []);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, city, latitude, longitude');

      if (error) throw error;
      setSites(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6DA047" />
        <Text style={{ marginTop: 10, color: '#555' }}>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === 'android' ? "none" : "standard"} 
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* === MAPBOX TILES === */}
        <UrlTile
          urlTemplate={MAPBOX_URL_TEMPLATE}
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Markers */}
        {sites.map((site) => (
          site.latitude && site.longitude ? (
            <Marker
              key={site.id}
              coordinate={{ latitude: site.latitude, longitude: site.longitude }}
              title={site.name}
              description={site.city}
            >
              <Ionicons name="location" size={40} color="#E91E63" />
              <Callout onPress={() => router.push(`/frontend/cultural_sites/${site.id}`)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{site.name}</Text>
                  <Text style={styles.calloutSub}>{site.city}</Text>
                  <Text style={styles.calloutLink}>Tap to View Details</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}
      </MapView>
      
      {/* Branding Overlay (Required by Mapbox Free Tier) */}
      <View style={styles.mapboxAttribution}>
        <Text style={styles.attribText}>© Mapbox © OpenStreetMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F0E9',
  },
  callout: { width: 150, padding: 5, alignItems: 'center' },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  calloutSub: { fontSize: 12, color: '#666' },
  calloutLink: { fontSize: 12, color: '#6DA047', fontWeight: 'bold', marginTop: 5 },
  
  // Mapbox Legal Attribution (Keep this small at bottom left)
  mapboxAttribution: {
    position: 'absolute',
    bottom: 85, // Above navbar
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 4,
    borderRadius: 4,
  },
  attribText: {
    fontSize: 10,
    color: '#333',
  }
});