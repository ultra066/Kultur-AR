import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Import Supabase Client
import { supabase } from '../../../lib/database/supabase';
// 2. Import Styles (Note the curly braces for named import)
import { styles } from './_site_details_styles';

export default function SiteDetailsScreen() {
  // Get the 'id' from the URL (e.g., from /cultural_sites/1)
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Fetch Data on Component Mount
  useEffect(() => {
    fetchSiteDetails();
  }, [id]); // Re-run if the ID changes

  const fetchSiteDetails = async () => {
    try {
      setLoading(true);
      // Fetch the single row from the 'sites' table where the 'id' matches
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single(); // .single() expects exactly one result

      if (error) throw error;
      setSite(data);
    } catch (error) {
      console.error('Error fetching site details:', error.message);
      // Optional: You could navigate back or show an error message here
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#355E3B" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  // If data fetch failed and loading is done, show nothing (or an error state)
  if (!site) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* --- Header Image & Back Button --- */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: site.image_url || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* --- Content Section --- */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{site.name}</Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={18} color="#666" />
            <Text style={styles.locationText}>
              {site.city ? `${site.city}, ` : ''}{site.province}
            </Text>
          </View>

          <Text style={styles.description}>
            {site.description || "No description available for this site."}
          </Text>

          {/* --- Action Buttons (AR & Reenactment) --- */}
          <View style={styles.actionsContainer}>
            
            {/* AR View Button */}
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('AR View Clicked')}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <MaterialCommunityIcons name="augmented-reality" size={32} color="#355E3B" />
              <Text style={styles.actionLabel}>AR View:</Text>
              <Text style={styles.actionSubLabel}>Available</Text>
            </TouchableOpacity>

            {/* Reenactment Button */}
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Reenactment Clicked')}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Ionicons name="people-outline" size={32} color="#355E3B" />
              <Text style={styles.actionLabel}>Reenactment:</Text>
              <Text style={styles.actionSubLabel}>Available</Text>
            </TouchableOpacity>
          </View>

          {/* --- Get Directions Button --- */}
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={() => {
              // In the future, you can open device maps here using Linking.openURL()
              console.log(`Get directions to: ${site.latitude}, ${site.longitude}`);
            }}
          >
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}