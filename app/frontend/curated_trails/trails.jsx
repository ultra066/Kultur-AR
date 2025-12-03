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
import SavedButton from '../components/savedButton/SavedButton';
import { useRouter } from 'expo-router';
import { useSavedItems } from '../components/SavedItemsContext';

// Import Styles
import { styles } from './_trails_styles';

// --- UPDATED DATA WITH ALL 6 TRAILS ---
const trailsData = [
  {
    id: '1',
    title: 'The Revolution Road',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Bonifacio_Trial_House.jpg',
    difficulty: 'Moderate',
    duration: '5 Hours',
    distance: '45 km',
    description: 'Trace the rise and fall of the Katipunan, from the balcony of independence to the mountains of Maragondon.'
  },
  {
    id: '2',
    title: 'Heroes of Kawit',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Aguinaldo_Shrine_Facade.jpg/1200px-Aguinaldo_Shrine_Facade.jpg',
    difficulty: 'Easy',
    duration: '2 Hours',
    distance: '3.0 km',
    description: 'A walking tour of the town that birthed the First Republic, focusing on Aguinaldo’s legacy.'
  },
  {
    id: '4',
    title: 'Valor & Martyrs Trail',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Pacific_War_Memorial_Corregidor.jpg', // Corregidor
    difficulty: 'Hard',
    duration: '6 Hours',
    distance: '30 km',
    description: 'A WWII-focused journey visiting Corregidor Island, Sangley Point, and the 41st Division Shrine.'
  },
  {
    id: '5',
    title: 'The Old Churches Loop',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Saint_Mary_Magdalene_Parish_Church_of_Kawit_-_Facade_%28Kawit%2C_Cavite%3B_04-23-2023%29.jpg',
    difficulty: 'Easy',
    duration: '3.5 Hours',
    distance: '25 km',
    description: 'A Visita Iglesia route featuring the centuries-old baroque churches of Silang, Maragondon, and Kawit.'
  },
  {
    id: '6',
    title: 'Heritage Food Crawl',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Pancit_Pusit_Cavite.jpg/640px-Pancit_Pusit_Cavite.jpg',
    difficulty: 'Easy',
    duration: '4 Hours',
    distance: '10 km',
    description: 'A gastronomic adventure tasting Pancit Pusit, Tamales, and Pahimis Coffee across three towns.'
  },
  {
    id: '7',
    title: 'Highland Art Crawl',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Museo_Orlina_Tagaytay.jpg',
    difficulty: 'Easy',
    duration: '4.0 hours',
    distance: '12.0 km',
    description: 'Relax in the cool breeze of Tagaytay while visiting world-class museums and art galleries.'
  },
];

export default function CuratedTrailsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { handleSave, isSaved } = useSavedItems();

  // Render Single Card
  const renderCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.9}
      // You can link this to a specific trail details page later
      onPress={() => router.push(`/frontend/curated_trails/${item.id}`)}
    >
      {/* Background Image */}
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      
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
          onPress={() => handleSave({ ...item, type: 'curated_trails' })}
          initialState={isSaved(item.id, 'curated_trails')}
        />
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

        {/* 3. List of Trails */}
        <FlatList
          data={trailsData}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

      </View>
    </SafeAreaView>
  );
}