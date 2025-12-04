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
import { supabase } from '../../../lib/database/supabase';
import { styles } from './_site_details_styles';

export default function SiteDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteDetails();
  }, [id]);

  const fetchSiteDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSite(data);
    } catch (error) {
      console.error('Error fetching site details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#355E3B" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!site) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Header Image */}
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

        {/* Content */}
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

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('AR View Clicked')}>
              {/* ADDED CORNERS STYLES MANUALLY IF NOT IN STYLES FILE, OR REMOVE IF UNUSED */}
              <MaterialCommunityIcons name="augmented-reality" size={32} color="#355E3B" />
              <Text style={styles.actionLabel}>AR View:</Text>
              <Text style={styles.actionSubLabel}>Available</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Reenactment Clicked')}>
              <Ionicons name="people-outline" size={32} color="#355E3B" />
              <Text style={styles.actionLabel}>Reenactment:</Text>
              <Text style={styles.actionSubLabel}>Available</Text>
            </TouchableOpacity>
          </View>

          {/* --- Get Directions Button (UPDATED) --- */}
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={() => {
              // Navigate to Map Screen with Destination Coordinates
              router.push({
                pathname: '/frontend/homepage/map',
                params: { 
                  destLat: site.latitude, 
                  destLon: site.longitude,
                  destName: site.name 
                }
              });
            }}
          >
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}