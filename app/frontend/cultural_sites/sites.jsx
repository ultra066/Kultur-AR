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

// 1. Import Supabase Client (Adjust path if needed)
import { supabase } from '../../../lib/database/supabase';
// 2. Import Styles
import { styles } from './sites_styles';

export default function CulturalSitesScreen() {
  const router = useRouter();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. FETCH DATA ON LOAD
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      // 'sites' MUST match your actual table name in Supabase
      const { data, error } = await supabase
        .from('sites') 
        .select('*')
        .order('name', { ascending: true }); // Sort Alphabetically

      if (error) throw error;
      
      if (data) {
        setSites(data);
      }
    } catch (error) {
      console.log("Error fetching sites:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. RENDER INDIVIDUAL CARD
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      // You can add navigation to a "Details" page later
      onPress={() => console.log("Clicked:", item.name)} 
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage} 
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={12} color="#6DA047" />
          {/* Display City if available, otherwise Province */}
          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.city || item.province}
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
        <Text style={styles.headerTitle}>Cultural Sites</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6DA047" />
          <Text style={styles.loadingText}>Loading Sites...</Text>
        </View>
      ) : (
        <FlatList
          data={sites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Creates the Grid Layout
          columnWrapperStyle={{ justifyContent: 'space-between' }} // Spacing between columns
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Empty State (If database is empty)
          ListEmptyComponent={
            <Text style={{textAlign:'center', marginTop: 50, color:'#888'}}>
              No sites found in the database.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}