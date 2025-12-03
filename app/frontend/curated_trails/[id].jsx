import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. IMPORT SUPABASE
import { supabase } from '../../../lib/database/supabase';

export default function TrailDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // 2. STATE FOR DATA
  const [trail, setTrail] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrailData();
  }, [id]);

  const fetchTrailData = async () => {
    try {
      setLoading(true);

      // A. GET TRAIL DETAILS (Header Info)
      const { data: trailData, error: trailError } = await supabase
        .from('trails')
        .select('*')
        .eq('id', id)
        .single();

      if (trailError) throw trailError;
      setTrail(trailData);

      // B. GET STOPS (Linked Sites)
      // We join 'trail_stops' with 'sites' to get the site name and image
      const { data: stopsData, error: stopsError } = await supabase
        .from('trail_stops')
        .select(`
          stop_order,
          notes,
          sites (
            id,
            name,
            city,
            province,
            image_url
          )
        `)
        .eq('trail_id', id)
        .order('stop_order', { ascending: true });

      if (stopsError) throw stopsError;
      setStops(stopsData);

    } catch (error) {
      console.log('Error fetching trail:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6DA047" />
      </View>
    );
  }

  if (!trail) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* HEADER IMAGE */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={{ uri: trail.image_url || 'https://via.placeholder.com/400' }} 
          style={styles.headerImage} 
          resizeMode="cover" 
        />
        <View style={styles.headerOverlay} />
        
        <SafeAreaView style={styles.headerSafeArea}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{trail.title}</Text>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* INFO BAR */}
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shoe-print" size={20} color="#555" />
            <Text style={styles.infoText}>{trail.distance || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.infoText}>{trail.duration || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.infoText}>{stops.length} Stops</Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.description}>{trail.description}</Text>

        {/* TIMELINE OF STOPS */}
        <View style={styles.timelineContainer}>
          {stops.map((item, index) => {
            // The 'sites' data is nested inside the item because of the join
            const site = item.sites; 
            const locationString = site ? `${site.city || ''}, ${site.province || ''}` : 'Unknown Location';
            
            return (
              <View key={index} style={styles.timelineItem}>
                {/* Left Side: Number & Line */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.numberCircle, item.stop_order === 1 && styles.activeCircle]}>
                    <Text style={[styles.numberText, item.stop_order === 1 && styles.activeNumberText]}>
                      {item.stop_order}
                    </Text>
                  </View>
                  {index < stops.length - 1 && (
                    <View style={styles.dashedLine} />
                  )}
                </View>

                {/* Right Side: Stop Card */}
                <View style={styles.stopCard}>
                  <Image 
                    source={{ uri: site?.image_url || 'https://via.placeholder.com/100' }} 
                    style={styles.stopImage} 
                  />
                  <View style={styles.stopInfo}>
                    <Text style={styles.stopTitle} numberOfLines={1}>{site?.name || 'Unknown Site'}</Text>
                    
                    {/* Updated Location Display */}
                    <View style={{flexDirection:'row', alignItems:'center', marginBottom: 8}}>
                       <Text style={[styles.stopType, {marginBottom: 0, marginRight: 6}]}>
                         {item.notes ? "Stop" : "Site"}
                       </Text>
                       <Text style={{fontSize: 11, color:'#888', flex: 1}} numberOfLines={1}>
                         • {locationString}
                       </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.viewDetailsButton} 
                      // Link to the specific Site Details Page
                      onPress={() => router.push(`/frontend/cultural_sites/${site?.id}`)}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* START TRAIL BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={() => console.log('Start Trail')}>
          <FontAwesome5 name="compass" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.startButtonText}>Start Trail</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F5', // Light cream background
  },
  // Header
  headerImageContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for footer
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0F0E8', // Slightly darker cream for the bar
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 30,
  },
  // Timeline
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 20,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  activeCircle: {
    backgroundColor: '#6DA047', // Green for the starting point
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  activeNumberText: {
    color: '#fff',
  },
  dashedLine: {
    position: 'absolute',
    top: 36,
    bottom: -20, // Extend to the next item
    width: 2,
    backgroundColor: '#ccc',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
  },
  // Stop Card
  stopCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F2F0E4', // Card background color from image
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stopImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 15,
  },
  stopInfo: {
    flex: 1,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stopType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  viewDetailsButton: {
    backgroundColor: '#E0E0E0', // Light gray button
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F9F9F5', // Match background to blend in
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  startButton: {
    backgroundColor: '#6DA047', // Green button color
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});