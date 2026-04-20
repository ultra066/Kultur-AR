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
import { Ionicons } from '@expo/vector-icons';

// 1. Import Supabase Client
import { supabase } from '../../../lib/database/supabase';
// 2. Import Styles
import { styles } from './_artifact_details_styles';

export default function ArtifactDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [artifact, setArtifact] = useState(null);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtifactDetails();
  }, [id]);

  const fetchArtifactDetails = async () => {
    try {
      setLoading(true);
      const { data: artifactData, error } = await supabase
        .from('artifacts')
        .select('*, sites(name, latitude, longitude, city)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtifact(artifactData);
      
      // Extract site details from join
      if (artifactData.sites) {
        setSite(artifactData.sites);
      }
    } catch (error) {
      console.error('Error fetching artifact details:', error.message);
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

  if (!artifact) return null;

  const siteName = site?.name || '';
  const hasSiteCoords = site?.latitude && site?.longitude;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: artifact.image_url || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{artifact.name}</Text>
          
          {/* Located At Site Name - Pin icon */}
          {siteName && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={18} color="#666" />
              <Text style={styles.locationText}>{siteName}</Text>
            </View>
          )}

          <Text style={styles.description}>
            {artifact.description || "No description available for this artifact."}
          </Text>

          {/* Map Button - Center on site location */}
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={() => {
              if (hasSiteCoords) {
                // Use site lat/lon for precise centering (like Sites)
                router.push({
                  pathname: '/frontend/homepage/map',
                  params: { 
                    destLat: site.latitude, 
                    destLon: site.longitude,
                    destName: siteName 
                  }
                });
              } else {
                // Fallback to search
                router.push({
                  pathname: '/frontend/homepage/map',
                  params: { 
                    searchQuery: siteName || artifact.current_location 
                  }
                });
              }
            }}
          >
            <Text style={styles.directionsText}>Map</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}
