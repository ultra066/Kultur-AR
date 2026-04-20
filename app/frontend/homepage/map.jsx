import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator, Alert,
  TextInput, TouchableOpacity, FlatList, Keyboard, ScrollView,  Image, Animated, PanResponder, Dimensions
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as polyline from '@mapbox/polyline';

import { supabase } from '../../../lib/database/supabase';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// --- COLORS ---
const PRIMARY_GREEN = "#6DA047";
const LIGHT_GREEN = "#A5C68A";

// --- MAPBOX CONFIGURATION ---
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2FudGlsbGFuamIwMzMiLCJhIjoiY21oMHAyeXBwMDF6OTJrcXpyZ3B6MXo3byJ9.HyebjVUxFqknP0lGm6arvg";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// Helper for arrival detection
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// --- HELPER TO RENDER CATEGORY ICON ---
const renderCategoryIcon = (category, isSelected, isCompleted = false) => {
  const size = isSelected ? 24 : 20;
  const color = isCompleted ? "#888" : (isSelected ? PRIMARY_GREEN : "#666");
  
  switch (category) {
    case 'House': return <Ionicons name="home" size={size} color={color} />;
    case 'Church': return <FontAwesome5 name="church" size={size - 4} color={color} />;
    case 'Monument': return <MaterialCommunityIcons name="pillar" size={size} color={color} />;
    case 'Mountain': return <FontAwesome5 name="mountain" size={size - 4} color={color} />;
    case 'Site': return <Ionicons name="location" size={size} color={color} />;
    default: return <Ionicons name="location-sharp" size={size} color={color} />;
  }
};

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { destLat, destLon, destName, trailId, trailData, city, type } = params;

  const cameraRef = useRef(null);

  // Data State
  const [location, setLocation] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSites, setFilteredSites] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Route State
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [travelMode, setTravelMode] = useState('driving'); 
  const [estimations, setEstimations] = useState({ driving: null, walking: null, cycling: null });

// Festival boundary GeoJSON from Supabase Storage



  // --- TRAIL STATE ---
  const [activeTrail, setActiveTrail] = useState(null);
  const [trailProgress, setTrailProgress] = useState(0); 
  const [isTrailCardExpanded, setIsTrailCardExpanded] = useState(false);
  const [trailRoute, setTrailRoute] = useState(null);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) closeSheet(); else openSheet();
      },
    })
  ).current;

  const openSheet = () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
  const closeSheet = () => {
    Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }).start(() => {
      setSelectedSite(null);
      setRouteInfo(null);
      setRoute(null);
    });
    Keyboard.dismiss();
  };

  useEffect(() => {
    let locationSubscription = null;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Location required for map.");
          setLocation({ latitude: 14.5995, longitude: 120.9842 });
          setLoading(false);
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation.coords);

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10 },
          (newLoc) => setLocation(newLoc.coords)
        );

        await fetchSites();
        if (trailData) {
          try {
            const parsedTrail = JSON.parse(trailData);
            setActiveTrail(parsedTrail);
            setIsTrailCardExpanded(true);
            if (parsedTrail.sites) {
              fetchTrailRoute(parsedTrail.sites);
              // Auto-route from user location to first site when trail starts
              if (userLocation && parsedTrail.sites.length > 0) {
                const firstSite = parsedTrail.sites[0];
                fetchInitialRoute(userLocation, firstSite);
              }
            }
          } catch (e) { console.error("Error parsing trailData", e); }
        } else if (trailId) {
          await fetchTrailData(trailId);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, [trailId, trailData]);

  // Arrival Tracking Effect
  useEffect(() => {
    if (!location || !activeTrail || trailProgress >= activeTrail.sites.length) return;
    const targetSite = activeTrail.sites[trailProgress];
    const dist = getDistance(location.latitude, location.longitude, targetSite.latitude, targetSite.longitude);
    if (dist < 30) {
      Alert.alert("Goal Reached!", `You arrived at ${targetSite.name}`);
      setTrailProgress(prev => prev + 1);
    }
  }, [location, activeTrail, trailProgress]);


  // Auto-center camera on destination coords - PRIORITY (sites button)
  useEffect(() => {
    console.log('Dest effect:', {destLat, destLon, mapReady: mapReady ? 'yes' : 'no'});
    if (!destLat || !destLon || !mapReady) return;
    
    const destLatitude = parseFloat(destLat);
    const destLongitude = parseFloat(destLon);
    
    if (isNaN(destLatitude) || isNaN(destLongitude)) {
      console.log('Invalid coords, skipping');
      return;
    }

    console.log('=== AUTO-CENTERING SITE ===', destLatitude, destLongitude);
    
    // Delay for camera stability
    const timer = setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [destLongitude, destLatitude],
          zoomLevel: 17
        });
        console.log('Camera set to site!');
      } else {
        console.error('cameraRef.current null!');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [destLat, destLon, mapReady]);


  // Site matching after sites load (for site detail pages - skip trails)
  useEffect(() => {
    if (!destLat || !destLon || !sites.length || trailId || trailData) return;

    console.log('Site matching for dest:', destLat, destLon);
    const destLatitude = parseFloat(destLat);
    const destLongitude = parseFloat(destLon);
    if (isNaN(destLatitude) || isNaN(destLongitude)) return;

    const matchingSite = sites.find(site => {
      return Math.abs((site.latitude || 0) - destLatitude) < 0.01 &&
             Math.abs((site.longitude || 0) - destLongitude) < 0.01;
    });

    if (matchingSite) {
      console.log('Site match:', matchingSite.name);
      setSelectedSite(matchingSite);
      setSearchQuery(destName || matchingSite.name);
      openSheet();
      
      // Explicitly center camera on matched site like handleSiteSelection
      if (mapReady && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [matchingSite.longitude, matchingSite.latitude],
          zoomLevel: 17
        }, { duration: 1000 });
        console.log('Centered on matched site from dest params');
      } else {
        // Fallback timeout like handleSiteSelection
        setTimeout(() => {
          if (cameraRef.current) {
            cameraRef.current.setCamera({
              centerCoordinate: [matchingSite.longitude, matchingSite.latitude],
              zoomLevel: 17
            }, { duration: 1000 });
            console.log('Fallback centered on matched site');
          }
        }, 500);
      }
      
      if (location) fetchEstimations(matchingSite, location);
    } else {
      console.log('No site match found for dest coords');
    }
  }, [destLat, destLon, sites.length, trailId, trailData, destName, location]);

// Fallback geocode only if festival and no valid dest coords
  useEffect(() => {
    if (type !== 'festival' || !city || !mapReady || (destLat && destLon)) return;

    const destLatitude = destLat ? parseFloat(destLat) : NaN;
    const destLongitude = destLon ? parseFloat(destLon) : NaN;
    if (!isNaN(destLatitude) && !isNaN(destLongitude)) return;

    const geocodeCity = async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=PH&types=place,city`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const center = data.features[0].center;
          console.log(`Festival geocode fallback:`, center);
          cameraRef.current.setCamera({
            centerCoordinate: center,
            zoomLevel: 12
          }, { duration: 2000 });
        }
      } catch (error) {
        console.error('Geocoding error:', city, error);
      }
    };

    geocodeCity();
  }, [city, type, mapReady, destLat, destLon]);

  const fetchSites = async () => {
    const { data, error } = await supabase.from('sites').select('*');
    if (!error) setSites(data);
  };

  const fetchTrailData = async (id) => {
    try {
      const { data: trail, error: trailErr } = await supabase
        .from('trails')
        .select(`
          id, name, 
          trail_stops (
            site_id, stop_order,
            sites (*)
          )
        `)
        .eq('id', id)
        .single();

      if (trailErr) throw trailErr;

      const sortedSites = trail.trail_stops
        .sort((a, b) => a.stop_order - b.stop_order)
        .map(ts => ts.sites);

      setActiveTrail({ ...trail, sites: sortedSites });
      setIsTrailCardExpanded(true);
      fetchTrailRoute(sortedSites);
    } catch (e) { console.error("Trail fetch error", e); }
  };

  const fetchTrailRoute = async (trailSites) => {
    if (trailSites.length < 2) return;
    const coords = trailSites.map(s => `${s.longitude},${s.latitude}`).join(';');
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=polyline6&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.routes && json.routes.length > 0) {
        const decodedPoints = polyline.decode(json.routes[0].geometry, 6).map(p => [p[1], p[0]]);
        setTrailRoute({ type: 'Feature', geometry: { type: 'LineString', coordinates: decodedPoints } });
      }
    } catch (e) { console.log("Trail route error"); }
  };

  // Auto-route from user location to first site when trail starts
  const fetchInitialRoute = async (userLocation, firstSite) => {
    if (!userLocation || !firstSite) return;
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${firstSite.longitude},${firstSite.latitude}?geometries=polyline6&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.routes && json.routes.length > 0) {
        const currentRoute = json.routes[0];
        const decodedPoints = polyline.decode(currentRoute.geometry, 6).map(p => [p[1], p[0]]);
        setRoute({ type: 'Feature', geometry: { type: 'LineString', coordinates: decodedPoints } });
        setRouteInfo({
          duration: Math.round(currentRoute.duration / 60),
          distance: (currentRoute.distance / 1000).toFixed(1),
          steps: currentRoute.legs[0].steps.map(step => step.maneuver.instruction),
        });
        // Set selected site and open the sheet
        setSelectedSite(firstSite);
        setTravelMode('driving');
        openSheet();
        // Fit camera to show route
        cameraRef.current?.fitBounds(
          [Math.max(...decodedPoints.map(c => c[0]), userLocation.longitude), Math.max(...decodedPoints.map(c => c[1]), userLocation.latitude)],
          [Math.min(...decodedPoints.map(c => c[0]), userLocation.longitude), Math.min(...decodedPoints.map(c => c[1]), userLocation.latitude)],
          { top: 50, right: 50, bottom: 450, left: 50 }, 
          1000
        );
      }
    } catch (error) { console.log("Initial route error", error); }
  };

const handleSiteSelection = (site) => {
    console.log('Site selected:', site.name, site.id);
    setSelectedSite(site);
    setSearchQuery(site.name);
    setShowResults(false);
    Keyboard.dismiss();
    setRoute(null);
    setRouteInfo(null);
    setTravelMode('driving');
    openSheet();
    if (mapReady && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [site.longitude, site.latitude],
        zoomLevel: 16
      }, { duration: 1000 });
    } else {
      setTimeout(() => {
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [site.longitude, site.latitude],
            zoomLevel: 16
          }, { duration: 1000 });
        }
      }, 500);
    }
    if (location) fetchEstimations(site, location);
  };

  const fetchEstimations = async (site, userLoc) => {
    const modes = ['driving', 'walking', 'cycling'];
    const results = { ...estimations };
    for (const mode of modes) {
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${userLoc.longitude},${userLoc.latitude};${site.longitude},${site.latitude}?access_token=${MAPBOX_ACCESS_TOKEN}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.routes && json.routes.length > 0) {
          results[mode] = Math.round(json.routes[0].duration / 60);
        }
      } catch (e) { }
    }
    setEstimations(results);
  };

  const handleGetDirections = async (mode = travelMode) => {
    if (!selectedSite || !location) return;
    setIsRouting(true);
    setTravelMode(mode);
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${location.longitude},${location.latitude};${selectedSite.longitude},${selectedSite.latitude}?geometries=polyline6&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.routes && json.routes.length > 0) {
        const currentRoute = json.routes[0];
        const decodedPoints = polyline.decode(currentRoute.geometry, 6).map(p => [p[1], p[0]]);
        setRoute({ type: 'Feature', geometry: { type: 'LineString', coordinates: decodedPoints } });
        setRouteInfo({
          duration: Math.round(currentRoute.duration / 60),
          distance: (currentRoute.distance / 1000).toFixed(1),
          steps: currentRoute.legs[0].steps.map(step => step.maneuver.instruction),
        });
        cameraRef.current?.fitBounds([Math.max(...decodedPoints.map(c => c[0])), Math.max(...decodedPoints.map(c => c[1]))], [Math.min(...decodedPoints.map(c => c[0])), Math.min(...decodedPoints.map(c => c[1]))], { top: 50, right: 50, bottom: 450, left: 50 }, 1000);
      }
    } catch (error) { Alert.alert("Error", "Route failed."); }
    finally { setIsRouting(false); }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      setFilteredSites(sites.filter(site => site.name.toLowerCase().includes(text.toLowerCase()) || site.city.toLowerCase().includes(text.toLowerCase())));
      setShowResults(true);
    } else setShowResults(false);
  };

  if (loading || !location) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={PRIMARY_GREEN} /></View>;

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} styleURL="mapbox://styles/mapbox/outdoors-v12" onPress={() => { setShowResults(false); Keyboard.dismiss(); closeSheet(); }} onDidFinishLoadingMapComplete={() => {
        console.log('Map fully loaded, mapReady=true');
        setMapReady(true);
      }}>
        <Mapbox.UserLocation />
        <Mapbox.Camera ref={cameraRef} defaultSettings={{ centerCoordinate: [location?.longitude || 120.9842, location?.latitude || 14.5995], zoomLevel: 12 }} />

        {sites.map((site) => {
          const isTrailSite = activeTrail?.sites.some(s => s.id === site.id);
          const trailIdx = activeTrail?.sites.findIndex(s => s.id === site.id);
          const isCompleted = isTrailSite && trailIdx < trailProgress;

          return (
            site.latitude && site.longitude ? (
              <Mapbox.PointAnnotation 
                key={`${site.id}_${selectedSite?.id === site.id ? 'selected' : 'unselected'}`}
                id={`${site.id.toString()}_${selectedSite?.id === site.id ? 'selected' : 'unselected'}`}
                title={site.name}
                coordinate={[site.longitude, site.latitude]} 
                onSelected={() => handleSiteSelection(site)}>
                <View style={[styles.markerCircle, { 
                  borderColor: isCompleted ? "#888" : (selectedSite?.id === site.id ? PRIMARY_GREEN : "#ccc"),
                  backgroundColor: isCompleted ? "#eee" : "white"
                }]}>


                  {renderCategoryIcon(site.Category, selectedSite?.id === site.id, isCompleted)}
                </View>
              </Mapbox.PointAnnotation>
            ) : null
          );
        })}

        {route && (
          <Mapbox.ShapeSource id="routeSource" shape={route}>
            <Mapbox.LineLayer id="routeFill" style={{ lineColor: PRIMARY_GREEN, lineWidth: 5, lineDasharray: travelMode === 'walking' ? [2, 2] : [1, 0] }} />
          </Mapbox.ShapeSource>
        )}

        {trailRoute && !route && (
          <Mapbox.ShapeSource id="trailRouteSource" shape={trailRoute}>
            <Mapbox.LineLayer id="trailRouteFill" style={{ lineColor: LIGHT_GREEN, lineWidth: 4, lineOpacity: 0.6 }} />
          </Mapbox.ShapeSource>
        )}

      </Mapbox.MapView>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={{marginRight: 10}} />
            <TextInput style={styles.searchInput} placeholder="Search heritage..." value={searchQuery} onChangeText={handleSearch} />
        </View>
        {showResults && filteredSites.length > 0 && (
            <View style={styles.resultsList}>
                <FlatList data={filteredSites} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem} onPress={() => handleSiteSelection(item)}><Text style={styles.resultTitle}>{item.name}</Text></TouchableOpacity>
                )} />
            </View>
        )}
      </View>

      {activeTrail && (
        <View style={styles.trailControlContainer}>
          <TouchableOpacity style={styles.trailToggleBtn} onPress={() => setIsTrailCardExpanded(!isTrailCardExpanded)}>
            <MaterialIcons name="map" size={24} color="white" />
            <Text style={styles.trailToggleText}>{isTrailCardExpanded ? 'Hide Trail' : 'Show Trail'}</Text>
          </TouchableOpacity>

          {isTrailCardExpanded && (
            <View style={styles.trailCard}>
              <View style={styles.trailHeader}>
                <Text style={styles.trailTitle}>{activeTrail.name}</Text>
                <Text style={styles.trailProgressText}>{trailProgress}/{activeTrail.sites.length} Visited</Text>
              </View>
              <ScrollView style={styles.trailSitesList}>
                {activeTrail.sites.map((site, index) => {
                  const isCompleted = index < trailProgress;
                  const isNext = index === trailProgress;
                  return (
                    <TouchableOpacity key={site.id} style={[styles.trailSiteItem, isNext && styles.nextTrailSite]} onPress={() => handleSiteSelection(site)}>
                      <Ionicons name={isCompleted ? "checkmark-circle" : (isNext ? "arrow-forward-circle" : "ellipse-outline")} size={20} color={isCompleted ? PRIMARY_GREEN : (isNext ? "#007AFF" : "#999")} />
                      <Text style={[styles.trailSiteName, isCompleted && styles.completedText]}>{site.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.stopTrailBtn} onPress={() => setActiveTrail(null)}><Text style={styles.stopTrailText}>End Trail</Text></TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {selectedSite && (
        <Animated.View style={[styles.modalCard, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
           <View style={styles.modalHandle} />
           <View style={styles.previewSection}>
              <Image source={{ uri: selectedSite.image_url || 'https://via.placeholder.com/150' }} style={styles.previewImage} />
              <View style={{flex: 1}}><Text style={styles.sheetTitle}>{selectedSite.name}</Text><Text style={styles.sheetSubtitle}>{selectedSite.city}</Text></View>
              <TouchableOpacity style={styles.closeButton} onPress={closeSheet}><Ionicons name="close" size={24} color="#555" /></TouchableOpacity>
           </View>

           <View style={styles.buttonRow}>
               <TouchableOpacity style={styles.infoButton} onPress={() => router.push(`/frontend/cultural_sites/${selectedSite.id}`)}><Text style={styles.infoButtonText}>View Info</Text></TouchableOpacity>
               <TouchableOpacity style={styles.dirMainButton} onPress={() => handleGetDirections()}><Text style={styles.dirButtonText}>Directions</Text></TouchableOpacity>
           </View>

           {routeInfo && (
              <View style={styles.routeSection}>
                 <View style={styles.divider} />
                 <View style={styles.modeBar}>
                    <TouchableOpacity style={[styles.modeTab, travelMode === 'driving' && styles.activeTab]} onPress={() => handleGetDirections('driving')}>
                      <Ionicons name="car" size={24} color={travelMode === 'driving' ? PRIMARY_GREEN : '#666'} />
                      <Text style={[styles.modeTime, travelMode === 'driving' && styles.activeTimeText]}>{estimations.driving ? `${estimations.driving}m` : '--'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modeTab, travelMode === 'cycling' && styles.activeTab]} onPress={() => handleGetDirections('cycling')}>
                      <MaterialIcons name="motorcycle" size={24} color={travelMode === 'cycling' ? PRIMARY_GREEN : '#666'} />
                      <Text style={[styles.modeTime, travelMode === 'cycling' && styles.activeTimeText]}>{estimations.cycling ? `${estimations.cycling}m` : '--'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modeTab, travelMode === 'walking' && styles.activeTab]} onPress={() => handleGetDirections('walking')}>
                      <Ionicons name="walk" size={24} color={travelMode === 'walking' ? PRIMARY_GREEN : '#666'} />
                      <Text style={[styles.modeTime, travelMode === 'walking' && styles.activeTimeText]}>{estimations.walking ? `${estimations.walking}m` : '--'}</Text>
                    </TouchableOpacity>
                 </View>
                 <Text style={styles.stepsLabel}>Steps ({routeInfo.distance} km):</Text>
                 <ScrollView style={styles.stepsContainer}>
                    {routeInfo.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}><Ionicons name="arrow-forward" size={16} color="#666" style={{marginRight: 8}}/><Text style={styles.stepText}>{step}</Text></View>
                    ))}
                 </ScrollView>
              </View>
           )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F0E9' },
  searchWrapper: { position: 'absolute', top: 50, width: '90%', alignSelf: 'center', zIndex: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, height: 50, elevation: 4 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  resultsList: { backgroundColor: 'white', borderRadius: 12, marginTop: 6, maxHeight: 200, elevation: 4 },
  resultItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  markerCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', borderWidth: 2, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  trailControlContainer: { position: 'absolute', top: 110, right: '5%', width: '60%', alignItems: 'flex-end', zIndex: 9 },
  trailToggleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_GREEN, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 5 },
  trailToggleText: { color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },
  trailCard: { backgroundColor: 'white', width: '100%', marginTop: 10, borderRadius: 15, padding: 15, elevation: 10 },
  trailHeader: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
  trailTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  trailProgressText: { fontSize: 12, color: PRIMARY_GREEN, fontWeight: '600' },
  trailSitesList: { maxHeight: 200 },
  trailSiteItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  nextTrailSite: { backgroundColor: '#f0f7ff', borderRadius: 8, paddingHorizontal: 5 },
  trailSiteName: { fontSize: 13, color: '#444', marginLeft: 10, flex: 1 },
  completedText: { textDecorationLine: 'line-through', color: '#999' },
  stopTrailBtn: { marginTop: 10, alignSelf: 'center', padding: 5 },
  stopTrailText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 12 },
  modalCard: { position: 'absolute', left: 0, right: 0, bottom: 60, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, padding: 20, paddingBottom: 20, marginHorizontal: 10, elevation: 20, maxHeight: SCREEN_HEIGHT * 0.75 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  previewSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  previewImage: { width: 60, height: 60, borderRadius: 12, marginRight: 15, backgroundColor: '#eee' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  sheetSubtitle: { fontSize: 14, color: '#666' },
  closeButton: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  infoButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 8 },
  infoButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  dirMainButton: { flex: 1, backgroundColor: PRIMARY_GREEN, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  dirButtonText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  routeSection: { marginTop: 5, flex: 1 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  modeBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f9f9f9', borderRadius: 12, paddingVertical: 10, marginBottom: 15 },
  modeTab: { alignItems: 'center', flex: 1 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: PRIMARY_GREEN },
  modeTime: { fontSize: 12, color: '#666', marginTop: 4 },
  activeTimeText: { color: PRIMARY_GREEN, fontWeight: 'bold' },
  stepsLabel: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10 },
  stepsContainer: { maxHeight: 200 },
  stepItem: { flexDirection: 'row', marginBottom: 12, paddingRight: 10 },
  stepText: { fontSize: 14, color: '#333', flex: 1, lineHeight: 20 },
});
