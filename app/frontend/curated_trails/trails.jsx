import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import SavedButton from '../components/savedButton/SavedButton';
import { useRouter } from 'expo-router';
import { useSavedItems } from '../components/SavedItemsContext';

// Import Supabase Client
import { supabase } from '../../../lib/database/supabase';

// Import Styles
import { styles } from './_trails_styles';

export default function CuratedTrailsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { handleSave, isSaved } = useSavedItems();
  
  // State for dynamic trails data
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trails from Supabase on mount
  useEffect(() => {
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trails')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setTrails(data);
    } catch (error) {
      console.log('Error fetching trails:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Single Card
  const renderCard = ({ item }) => {
    // 1. Clean the URL and provide a fallback if it's null/empty
    const cleanImageUrl = item.image_url 
      ? item.image_url.trim() 
      : 'https://via.placeholder.com/400?text=No+Image';

    return (
      <TouchableOpacity 
        style={styles.cardContainer} 
        activeOpacity={0.9}
        onPress={() => router.push(`/frontend/curated_trails/${item.id}`)}
      >
        {/* Background Image - Using the cleaned URL */}
        <Image 
          source={{ uri: cleanImageUrl }} 
          style={styles.cardImage} 
          resizeMode="cover" 
        />
        
        {/* Dark Gradient Overlay */}
        <View style={styles.cardOverlay}>
          
          {/* Title */}
          <Text style={styles.cardTitle}>{item.title}</Text>
          
          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <FontAwesome5 name="mountain" size={12} color="#e0e0e0" />
              <Text style={styles.metaText}>{item.difficulty}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#e0e0e0" />
              <Text style={styles.metaText}>{item.duration}</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="shoe-print" size={14} color="#e0e0e0" />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
          </View>

        </View>
          <SavedButton
            isSaved={isSaved(item.id, 'curated_trails')}
            onToggleSave={() => handleSave({
              id: item.id,
              type: 'curated_trails',
              name: item.title,
              description: item.description,
              image_url: cleanImageUrl, // Save the cleaned URL here too
            })}
          />
        {/* Circular Explore Button */}
        <View style={styles.exploreButton}>
          <Ionicons name="compass-outline" size={24} color="#333" />
        </View>
        <Text style={styles.exploreLabel}>Explore</Text>

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F5" />
      
      <View style={styles.container}>
        
        {/* 1. Title Header */}
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Curated Trails</Text>
                <Text style={styles.headerSubtitle}>Discover your next adventure.</Text>
            </View>
        </View>

        {/* 2. Search & Filter Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              placeholder="Search" 
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#333" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* 3. List of Trails or Loading State */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6DA047" />
          </View>
        ) : (
          <FlatList
            data={trails.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))}
            renderItem={renderCard}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

      </View>
    </SafeAreaView>
  );
}