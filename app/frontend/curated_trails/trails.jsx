import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import Styles
import { styles } from './_trails_styles';

// --- DATA (Cavite Themed) ---
const trailsData = [
  {
    id: '1',
    title: 'The Revolution Trail',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Bonifacio_Trial_House.jpg',
    difficulty: 'Moderate',
    duration: '2.5 hours',
    distance: '5.2 km'
  },
  {
    id: '2',
    title: 'Heroes of Kawit',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Aguinaldo_Shrine_Facade.jpg/1200px-Aguinaldo_Shrine_Facade.jpg',
    difficulty: 'Easy',
    duration: '1.5 hours',
    distance: '3.0 km'
  },
  {
    id: '3',
    title: 'Coastal Heritage',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Zapote_Bridge_%28Bacoor_side%29.JPG/640px-Zapote_Bridge_%28Bacoor_side%29.JPG',
    difficulty: 'Easy',
    duration: '3.0 hours',
    distance: '7.5 km'
  },
  {
    id: '4',
    title: 'Highland Art Crawl',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Museo_Orlina_Tagaytay.jpg',
    difficulty: 'Easy',
    duration: '4.0 hours',
    distance: '12.0 km'
  },
];

export default function CuratedTrailsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Render Single Card
  const renderCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.9}
      onPress={() => console.log(`Clicked ${item.title}`)} // Add navigation later
    >
      {/* Background Image */}
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      
      {/* Dark Gradient Overlay */}
      <View style={styles.cardOverlay}>
        
        {/* Title */}
        <Text style={styles.cardTitle}>{item.title}</Text>
        
        {/* Metadata Row (Mountain Icon, Clock, Distance) */}
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

      {/* Circular Explore Button */}
      <View style={styles.exploreButton}>
        <Ionicons name="compass-outline" size={24} color="#333" />
      </View>
      <Text style={styles.exploreLabel}>Explore</Text>

    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F5" />
      
      <View style={styles.container}>
        
        {/* 1. Title Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Curated Trails</Text>
          <Text style={styles.headerSubtitle}>Discover your next adventure.</Text>
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

        {/* 3. List of Trails */}
        <FlatList
          data={trailsData}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom navbar
        />

      </View>
    </SafeAreaView>
  );
}