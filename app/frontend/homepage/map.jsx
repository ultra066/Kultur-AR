import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Platform, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import MapView, { Marker, Callout, UrlTile, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../../lib/database/supabase';

// --- MAPBOX CONFIGURATION ---
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2FudGlsbGFuamIwMzMiLCJhIjoiY21oMHAyeXBwMDF6OTJrcXpyZ3B6MXo3byJ9.HyebjVUxFqknP0lGm6arvg"; 
const MAPBOX_STYLE_ID = "outdoors-v12"; 
const MAPBOX_USERNAME = "mapbox";
const MAPBOX_URL_TEMPLATE = `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;

export default function MapScreen() {
  const router = useRouter();
  
  // These params only exist if "Get Directions" was clicked
  const params = useLocalSearchParams();
  const { destLat, destLon } = params;

  const mapRef = useRef(null);
  const markerRefs = useRef({});

  const [location, setLocation] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSites, setFilteredSites] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Routing State
  const [routeCoords, setRouteCoords] = useState([]);

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
      
      // ONLY fetch route if "Get Directions" was clicked (params exist)
      if (destLat && destLon) {
        fetchRoute(userLocation.coords.latitude, userLocation.coords.longitude, parseFloat(destLat), parseFloat(destLon));
      }

      fetchSites();
    })();
  }, [destLat, destLon]); 

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

  // --- ROUTING FUNCTION (Mapbox API) ---
  const fetchRoute = async (startLat, startLon, endLat, endLon) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      const response = await fetch(url);
      const json = await response.json();

      if (json.routes && json.routes.length > 0) {
        const coordinates = json.routes[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRouteCoords(coordinates);

        // Zoom to fit the route
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const results = sites.filter(site =>
        site.name.toLowerCase().includes(text.toLowerCase()) ||
        site.city.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSites(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // === MODIFIED: SELECT SITE (No Route Calculation) ===
  const onSelectSite = (site) => {
    setSearchQuery(site.name);
    setShowResults(false);
    Keyboard.dismiss();
    
    // Clear any previous blue lines so the map is clean
    setRouteCoords([]); 

    // 1. Zoom to the site
    mapRef.current?.animateToRegion({
      latitude: site.latitude,
      longitude: site.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);

    // 2. Open the Callout (Info Bubble)
    setTimeout(() => {
        if (markerRefs.current[site.id]) {
            markerRefs.current[site.id].showCallout();
        }
    }, 1000);
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
        ref={mapRef}
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
        onPress={() => {
            setShowResults(false);
            Keyboard.dismiss();
        }}
      >
        <UrlTile
          urlTemplate={MAPBOX_URL_TEMPLATE}
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Blue Route Line (Only shows if routeCoords has data) */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}

        {/* Markers */}
        {sites.map((site) => (
          site.latitude && site.longitude ? (
            <Marker
              key={site.id}
              ref={(ref) => markerRefs.current[site.id] = ref}
              coordinate={{ latitude: site.latitude, longitude: site.longitude }}
              title={site.name}
              description={site.city}
            >
              <Ionicons name="location" size={40} color="#E91E63" />
              <Callout onPress={() => router.push(`/frontend/cultural_sites/${site.id}`)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{site.name}</Text>
                  <Text style={styles.calloutSub}>{site.city}</Text>
                  <Text style={styles.calloutLink}>Tap to View Details →</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}
      </MapView>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={{marginRight: 10}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a site..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setShowResults(false); Keyboard.dismiss(); }}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
            )}
        </View>

        {showResults && filteredSites.length > 0 && (
            <View style={styles.resultsList}>
                <FlatList
                    data={filteredSites}
                    keyExtractor={(item) => item.id.toString()}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.resultItem} onPress={() => onSelectSite(item)}>
                            <Ionicons name="location-outline" size={18} color="#666" style={{marginRight: 10}} />
                            <View>
                                <Text style={styles.resultTitle}>{item.name}</Text>
                                <Text style={styles.resultCity}>{item.city}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        )}
      </View>
      
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
  callout: { width: 160, padding: 5, alignItems: 'center' },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 2, textAlign:'center' },
  calloutSub: { fontSize: 12, color: '#666', marginBottom: 4 },
  calloutLink: { fontSize: 12, color: '#6DA047', fontWeight: 'bold' },
  
  mapboxAttribution: {
    position: 'absolute',
    bottom: 85,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 4,
    borderRadius: 4,
  },
  attribText: { fontSize: 10, color: '#333' },

  searchWrapper: {
    position: 'absolute',
    top: 50,
    width: '90%',
    alignSelf: 'center',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  resultsList: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resultCity: {
    fontSize: 12,
    color: '#888',
  },
});