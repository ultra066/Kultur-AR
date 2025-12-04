import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import SavedButton from '../components/savedButton/SavedButton';

import { useSavedItems } from '../components/SavedItemsContext';

// 1. Import Supabase Client (Adjust path if needed)
import { supabase } from '../../../lib/database/supabase';
// 2. Import Styles
import { styles } from './artifacts_styles';

export default function ArtifactsScreen() {
  const router = useRouter();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleSave, isSaved } = useSavedItems();

  // 3. FETCH DATA ON LOAD
  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      // 'artifacts' MUST match your actual table name in Supabase
      const { data, error } = await supabase
        .from('artifacts') 
        .select('*')
        .order('name', { ascending: true }); // Sort Alphabetically

      if (error) throw error;
      
      if (data) {
        setArtifacts(data);
      }
    } catch (error) {
      console.log("Error fetching artifacts:", error.message);
    } finally {
      setLoading(false);
    }
  };

    const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/frontend/artifacts/${String(item.id)}`)}
    >
      <Image
        source={{ uri: typeof item.image_url === 'string' ? item.image_url : 'https://via.placeholder.com/150' }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <SavedButton
        isSaved={isSaved(item.id, 'artifacts')}
        onToggleSave={() => handleSave({
          id: item.id,
          type: 'artifacts',
          name: item.name,
          description: '', // Assuming no description field in artifacts table
          image_url: item.image_url,
        })}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{String(item.name || '')}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={12} color="#6DA047" />
          <Text style={styles.cardLocation} numberOfLines={1}>
            {String(item.current_location || '')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artifacts</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6DA047" />
          <Text style={styles.loadingText}>Loading Artifacts...</Text>
        </View>
      ) : (
        <FlatList
          data={artifacts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Creates the Grid Layout
          columnWrapperStyle={{ justifyContent: 'space-between' }} // Spacing between columns
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Empty State (If database is empty)
          ListEmptyComponent={
            <Text style={{textAlign:'center', marginTop: 50, color:'#888'}}>
              No artifacts found in the database.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}