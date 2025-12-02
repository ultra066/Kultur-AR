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
// 2. Import Styles
import { styles } from './_artifact_details_styles';

export default function ArtifactDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtifactDetails();
  }, [id]);

  const fetchArtifactDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtifact(data);
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

          <Text style={styles.description}>
            {artifact.description || "No description available for this artifact."}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('3D View Clicked')}>
              <MaterialCommunityIcons name="cube-scan" size={32} color="#355E3B" />
              <Text style={styles.actionLabel}>3D View</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}