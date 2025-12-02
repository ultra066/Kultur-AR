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
import { styles } from './_cuisine_details_styles';

export default function CuisineDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [cuisine, setCuisine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCuisineDetails();
  }, [id]);

  const fetchCuisineDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cuisines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCuisine(data);
    } catch (error) {
      console.error('Error fetching cuisine details:', error.message);
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

  if (!cuisine) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: cuisine.image_url || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{cuisine.name}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={18} color="#666" />
            <Text style={styles.locationText}>
              {cuisine.city_origin || cuisine.province}
            </Text>
          </View>

          <Text style={styles.description}>
            {cuisine.description || "No description available for this cuisine."}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('View Recipe Clicked')}>
              <Ionicons name="restaurant-outline" size={32} color="#355E3B" />
              <Text style={styles.actionLabel}>View Recipe</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}