import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator, Alert,
  TextInput, TouchableOpacity, FlatList, Keyboard, ScrollView,Image, Animated, PanResponder, Dimensions
} from 'react-native';
import Mapbox from '@rnmapbox/maps'; // <--- Ensure this is correct
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as polyline from '@mapbox/polyline';

import { supabase } from '../../../lib/database/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- MAPBOX CONFIGURATION ---
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2FudGlsbGFuamIwMzMiLCJhIjoiY21oMHAyeXBwMDF6OTJrcXpyZ3B6MXo3byJ9.HyebjVUxFqknP0lGm6arvg";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { destLat, destLon, destName } = params;

  const cameraRef = useRef(null);

  // Data State
  const [location, setLocation] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSites, setFilteredSites] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Route State
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // --- ANIMATED BOTTOM SHEET STATE ---
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // --- PAN RESPONDER ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeSheet();
        } else {
          openSheet();
        }
      },
    })
  ).current;

  const openSheet = () => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }).start(() => {
      setSelectedSite(null);
      setRouteInfo(null);
      setRoute(null);
    });
    Keyboard.dismiss();
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Location permission is required to show your position on the map.");
          setLocation({ latitude: 14.5995, longitude: 120.9842 }); // Fallback
          setLoading(false);
          return;
        }

        const locationPromise = Location.getCurrentPositionAsync({});
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

        try {
            let userLocation = await Promise.race([locationPromise, timeoutPromise]);
            setLocation(userLocation.coords);
        } catch (e) {
            console.log("Location fetch timed out or failed, using fallback.");
            setLocation({ latitude: 14.5995, longitude: 120.9842 }); 
        }

        if (destLat && destLon) {
          const tempSite = {
            id: 'nav_target',
            name: destName || 'Destination',
            latitude: parseFloat(destLat),
            longitude: parseFloat(destLon),
            image_url: 'https://via.placeholder.com/150'
          };
          handleSiteSelection(tempSite);
          setTimeout(() => handleGetDirections(tempSite, location || { latitude: 14.5995, longitude: 120.9842 }), 1000);
        }
        
        await fetchSites();
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();
  }, [destLat, destLon]);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, city, latitude, longitude, image_url');
      if (error) throw error;
      setSites(data);
    } catch (error) { console.log(error); }
    finally { setLoading(false); }
  };

  const handleSiteSelection = (site) => {
    setSelectedSite(site);
    setSearchQuery(site.name);
    setShowResults(false);
    Keyboard.dismiss();

    setRoute(null);
    setRouteInfo(null);

    openSheet();

    cameraRef.current?.flyTo([site.longitude, site.latitude], 1000);
  };

  const handleGetDirections = async (site = selectedSite, userLoc = location) => {
    if (!site || !userLoc) return;
    setIsRouting(true);

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLoc.longitude},${userLoc.latitude};${site.longitude},${site.latitude}?geometries=polyline6&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.routes && json.routes.length > 0) {
        const currentRoute = json.routes[0];
        const decodedPoints = polyline.decode(currentRoute.geometry, 6);
        const coordinates = decodedPoints.map(point => [point[1], point[0]]);

        const routeGeoJSON = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        };
        setRoute(routeGeoJSON);

        const durationMins = Math.round(currentRoute.duration / 60);
        const distanceKm = (currentRoute.distance / 1000).toFixed(1);
        setRouteInfo({
          duration: durationMins,
          distance: distanceKm,
          steps: currentRoute.legs[0].steps.map(step => step.maneuver.instruction),
        });

        const [ne, sw] = coordinates.reduce(([ne, sw], coord) => [
            [Math.max(ne[0], coord[0]), Math.max(ne[1], coord[1])],
            [Math.min(sw[0], coord[0]), Math.min(sw[1], coord[1])],
        ], [[-Infinity, -Infinity], [Infinity, Infinity]]);

        cameraRef.current?.fitBounds(ne, sw, { top: 50, right: 50, bottom: 400, left: 50 }, 1000);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Could not calculate route.");
    } finally {
      setIsRouting(false);
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

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6DA047" />
        <Text style={{marginTop: 10, color: '#666'}}>Fetching location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/outdoors-v12"
        onPress={() => {
          setShowResults(false);
          Keyboard.dismiss();
          closeSheet();
        }}
        onDidFailLoadingMap={(e) => console.error("Map failed to load:", e)}
      >
        <Mapbox.UserLocation />
        <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
                centerCoordinate: [location.longitude, location.latitude],
                zoomLevel: 12,
            }}
        />

        {sites.map((site) => (
          site.latitude && site.longitude ? (
            <Mapbox.PointAnnotation
              key={site.id}
              id={site.id.toString()}
              coordinate={[site.longitude, site.latitude]}
              onSelected={() => handleSiteSelection(site)}
            >
              <Ionicons name="location" size={40} color={selectedSite?.id === site.id ? "#007AFF" : "#E91E63"} />
            </Mapbox.PointAnnotation>
          ) : null
        ))}

        {route && (
          <Mapbox.ShapeSource id="routeSource" shape={route}>
            <Mapbox.LineLayer id="routeFill" style={{ lineColor: '#007AFF', lineWidth: 5 }} />
          </Mapbox.ShapeSource>
        )}

      </Mapbox.MapView>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={{marginRight: 10}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search site..."
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
                        <TouchableOpacity style={styles.resultItem} onPress={() => handleSiteSelection(item)}>
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

      {selectedSite && (
        <Animated.View
           style={[styles.modalCard, { transform: [{ translateY }] }]}
           {...panResponder.panHandlers}
        >
           <View style={styles.modalHandle} />
           <View style={styles.previewSection}>
              <Image
                 source={{ uri: selectedSite.image_url || 'https://via.placeholder.com/150' }}
                 style={styles.previewImage}
              />
              <View style={{flex: 1}}>
                  <Text style={styles.sheetTitle}>{selectedSite.name}</Text>
                  <Text style={styles.sheetSubtitle}>
                     {routeInfo ? `${routeInfo.duration} min (${routeInfo.distance} km)` : selectedSite.city}
                  </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
                 <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
           </View>
           <View style={styles.buttonRow}>
               {/* 
                  UPDATED: Pass the model address dynamically to AR Mode 
                  Assuming 'site.model_address' exists in your Supabase DB.
                  If not, you can hardcode a test one here to verify.
               */}
               <TouchableOpacity
                   style={styles.infoButton}
                   onPress={() => router.push({
                       pathname: '/ar_mode',
                       params: { 
                           mode: 'HistoricalSite',
                           // Use the column from your DB, or a fallback string
                           modelAddress: site.model_address || 'Assets/Prefabs/AR/Historical/3D Models/Imus/ImusCathedral.prefab' 
                       }
                   })}
               >
                   <Text style={styles.infoButtonText}>View in AR</Text>
               </TouchableOpacity>
               <TouchableOpacity
                   style={styles.dirButton}
                   onPress={() => handleGetDirections()}
               >
                   {isRouting ? <ActivityIndicator color="#fff"/> : <Text style={styles.dirButtonText}>Get Directions</Text>}
               </TouchableOpacity>
           </View>
           {routeInfo && (
              <View style={styles.routeSection}>
                 <View style={styles.divider} />
                 <Text style={styles.stepsLabel}>Steps:</Text>
                 <ScrollView style={styles.stepsContainer}>
                    {routeInfo.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <Ionicons name="arrow-forward" size={16} color="#666" style={{marginRight: 8}}/>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                 </ScrollView>
              </View>
           )}
        </Animated.View>
      )}

      {!selectedSite && (
        <View style={styles.mapboxAttribution}>
          <Text style={styles.attribText}>© Mapbox © OpenStreetMap</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F0E9',
  },
  searchWrapper: { position: 'absolute', top: 50, width: '90%', alignSelf: 'center', zIndex: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },
  resultsList: { backgroundColor: 'white', borderRadius: 12, marginTop: 6, maxHeight: 200, elevation: 4 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  resultCity: { fontSize: 12, color: '#888' },
  modalCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
    minHeight: 250,
    maxHeight: '60%',
  },
  modalHandle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  previewSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  previewImage: { width: 60, height: 60, borderRadius: 12, marginRight: 15, backgroundColor: '#eee' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  sheetSubtitle: { fontSize: 14, color: '#666' },
  closeButton: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  infoButtonText: { fontSize: 15, fontWeight: '600', color: '#333' },
  dirButton: { flex: 1, backgroundColor: '#6DA047', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  dirButtonText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  routeSection: { marginTop: 10, flex: 1 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  stepsLabel: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10 },
  stepsContainer: { maxHeight: 200 },
  stepItem: { flexDirection: 'row', marginBottom: 12, paddingRight: 10 },
  stepText: { fontSize: 14, color: '#333', flex: 1, lineHeight: 20 },
  mapboxAttribution: { position: 'absolute', bottom: 20, left: 10, backgroundColor: 'rgba(255,255,255,0.7)', padding: 4, borderRadius: 4 },
  attribText: { fontSize: 10, color: '#333' },
});