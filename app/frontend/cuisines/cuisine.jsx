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
import { styles } from './cuisine_styles';

export default function CuisinesScreen() {
  const router = useRouter();
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleSave, isSaved } = useSavedItems();

  // 3. FETCH DATA ON LOAD
  useEffect(() => {
    fetchCuisines();
  }, []);

  const fetchCuisines = async () => {
    try {
      setLoading(true);
      // 'cuisines' MUST match your actual table name in Supabase
      const { data, error } = await supabase
        .from('cuisines') 
        .select('*')
        .order('name', { ascending: true }); // Sort Alphabetically

      if (error) throw error;
      
      if (data) {
        setCuisines(data);
      }
    } catch (error) {
      console.log("Error fetching cuisines:", error.message);
    } finally {
      setLoading(false);
    }
  };

    const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      // You can add navigation to a "Details" page later
      onPress={() => router.push(`/frontend/cuisines/${item.id}`)} 
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage} 
        resizeMode="cover"
      />
      <SavedButton
        isSaved={isSaved(item.id, 'cuisines')}
        onToggleSave={() => handleSave({
          id: item.id,
          type: 'cuisines',
          name: item.name,
          description: '', // Assuming no description field in cuisines table
          image_url: item.image_url,
        })}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={12} color="#6DA047" />
          {/* Display City if available, otherwise Province */}
          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.city_origin || item.province}
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
        <Text style={styles.headerTitle}>Cuisines</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6DA047" />
          <Text style={styles.loadingText}>Loading Cuisines...</Text>
        </View>
      ) : (
        <FlatList
          data={cuisines}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Creates the Grid Layout
          columnWrapperStyle={{ justifyContent: 'space-between' }} // Spacing between columns
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Empty State (If database is empty)
          ListEmptyComponent={
            <Text style={{textAlign:'center', marginTop: 50, color:'#888'}}>
              No cuisines found in the database.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}