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

// 1. Import Supabase Client (Ensure path is correct)
import { supabase } from '../../../lib/database/supabase';
// 2. Import Styles
import { styles } from './festivals_styles';

export default function FestivalsScreen() {
  const router = useRouter();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleSave, isSaved } = useSavedItems();

  // 3. FETCH DATA ON LOAD
  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('festivals') 
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setFestivals(data);
      }
    } catch (error) {
      console.log("Error fetching festivals:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/frontend/festivals/${item.id}`)} 
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage} 
        resizeMode="cover"
      />
      <SavedButton
        isSaved={isSaved(item.id, 'festivals')}
        onToggleSave={() => handleSave({
          id: item.id,
          type: 'festivals',
          name: item.name,
          description: item.description || '', 
          image_url: item.image_url,
        })}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={12} color="#6DA047" />
          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.city}
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
        <Text style={styles.headerTitle}>Festivals</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6DA047" />
          <Text style={styles.loadingText}>Loading Festivals...</Text>
        </View>
      ) : (
        <FlatList
          data={festivals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{textAlign:'center', marginTop: 50, color:'#888'}}>
              No festivals found in the database.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
