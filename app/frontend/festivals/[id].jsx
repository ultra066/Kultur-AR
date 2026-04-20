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
import { supabase } from '../../../lib/database/supabase';
import { styles } from './_festival_details_styles';

export default function FestivalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFestivalDetails();
  }, [id]);

  const fetchFestivalDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFestival(data);
    } catch (error) {
      console.error('Error fetching festival details:', error.message);
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

  if (!festival) return null;

  const locationText = festival.city + (festival.month_celebrated ? `, ${festival.month_celebrated}` : '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: festival.image_url || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{festival.name}</Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={18} color="#666" />
            <Text style={styles.locationText}>
              {locationText}
            </Text>
          </View>

          <Text style={styles.description}>
            {festival.description || "No description available for this festival."}
          </Text>



        </View>
      </ScrollView>
    </View>
  );
}
