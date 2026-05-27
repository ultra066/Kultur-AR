import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/database/supabase';

// Make sure this file exists in the same folder!
import { styles } from './home_styles';

export default function HomeScreen() {
  const router = useRouter();
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      // Fetch all trails
      const { data: trailsData, error: trailsError } = await supabase
.from('trails')
        .select('*')
        .in('title', ['The Revolution Road', 'The Old Churches Loop', 'Heroes of Kawit']);

      if (trailsError) throw trailsError;

      // For each trail, fetch its stop count
      const trailsWithStopCounts = await Promise.all(
        trailsData.map(async (trail) => {
          const { count, error: countError } = await supabase
            .from('trail_stops')
            .select('*', { count: 'exact', head: true })
            .eq('trail_id', trail.id);

          if (countError) throw countError;
          
          return {
            ...trail,
            stop_count: count || 0,
          };
        })
      );

      const curatedOrder = ['The Revolution Road', 'The Old Churches Loop', 'Heroes of Kawit'];
      const orderIndex = new Map(curatedOrder.map((t, idx) => [t, idx]));
      const ordered = trailsWithStopCounts.slice().sort((a, b) => {
        const ia = orderIndex.has(a.title) ? orderIndex.get(a.title) : Number.MAX_SAFE_INTEGER;
        const ib = orderIndex.has(b.title) ? orderIndex.get(b.title) : Number.MAX_SAFE_INTEGER;
        return ia - ib;
      });

      setTrails(ordered);
    } catch (error) {
      console.error('Error fetching trails:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result) => {
    const { id, type } = result;
    const route = {
      Site: `/frontend/cultural_sites/${id}`,
      Festival: `/frontend/festivals/${id}`,
      Artifact: `/frontend/artifacts/${id}`,
      Cuisine: `/frontend/cuisines/${id}`,
      City: `/frontend/cities/${id}`,
    }[type];

    if (route) {
      router.push(route);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const [sites, festivals, artifacts, cuisines, cities] = await Promise.all([
        supabase.from('sites').select('id, name, city').or(`name.ilike.%${query}%,city.ilike.%${query}%`),
        supabase.from('festivals').select('id, name, city').or(`name.ilike.%${query}%,city.ilike.%${query}%`),
        supabase.from('artifacts').select('id, name, current_location').or(`name.ilike.%${query}%,current_location.ilike.%${query}%`),
        supabase.from('cuisines').select('id, name, city_origin').or(`name.ilike.%${query}%,city_origin.ilike.%${query}%`),
        supabase.from('cities').select('id, name').ilike('name', `%${query}%`),
      ]);

      const results = [
        ...(sites.data || []).map(item => ({ ...item, type: 'Site', city: item.city })),
        ...(festivals.data || []).map(item => ({ ...item, type: 'Festival', city: item.city })),
        ...(artifacts.data || []).map(item => ({ ...item, type: 'Artifact', city: item.current_location })),
        ...(cuisines.data || []).map(item => ({ ...item, type: 'Cuisine', city: item.city_origin })),
        ...(cities.data || []).map(item => ({ ...item, type: 'City' })),
      ];

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error.message);
    } finally {
      setLoading(false);
    }
  };

    const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleBack = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Dark Status Bar for Dark Theme */}
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* 2. Search Bar */}
      <View style={styles.searchContainer}>
        {isSearching ? (
          <TouchableOpacity onPress={handleBack} style={styles.searchIcon}>
            <Ionicons name="arrow-back" size={24} color="#888" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        )}
        <TextInput 
          placeholder="Search sites, festivals, history..." 
          style={styles.searchInput} 
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Greeting */}
        {!isSearching && (
          <View style={styles.headerContainer}>
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greetingSub}>Mabuhay,</Text>
              <Text style={styles.greetingTitle}>Ka-Kultura!</Text>
            </View>

            <TouchableOpacity
              style={styles.profileIconButton}
              onPress={() => router.push('/frontend/profile/profile')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <Ionicons name="person" size={20} color="#6DA047" />
            </TouchableOpacity>
          </View>
        )}

        {isSearching ? (
          <SearchResultsList results={searchResults} onResultPress={handleResultPress} />
        ) : (
          <>
            {/* 3. Map Guide Banner */}
            <TouchableOpacity 
              style={styles.mapBannerContainer} 
              onPress={() => router.push('/frontend/homepage/map')}
            >
              {/* Use a real map image here */}
              <Image 
                source={{ uri: 'https://eifomocplfshvfrympiu.supabase.co/storage/v1/object/public/KulturAR-assets/TRAILS/Map.jpg' }} 
                style={styles.mapImage} 
                resizeMode="cover"
              />
              <View style={styles.mapOverlay}>
                <Text style={styles.mapTitle}>Map Guide</Text>
                <Text style={styles.mapSubtitle}>Navigate your historical journey through Cavite.</Text>
                <View style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>OPEN GUIDE</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* 4. Category Grid (Colored Icons) */}
            <View style={styles.categoryGrid}>
              {/* LINKED TO SITES PAGE */}
              <CategoryItem 
                icon={<FontAwesome5 name="landmark" size={24} color="#4CAF50" />} 
                label="Sites" 
                color="#E8F5E9" 
                onPress={() => router.push('/frontend/cultural_sites/sites')} 
              />
              
              <CategoryItem 
                icon={<MaterialCommunityIcons name="party-popper" size={24} color="#E91E63" />} 
                label="Festivals" 
                color="#FCE4EC" 
                onPress={() => router.push('/frontend/festivals/festivals')}
              />
              
              <CategoryItem 
                icon={<FontAwesome5 name="scroll" size={24} color="#FF9800" />} 
                label="Artifacts" 
                color="#FFF3E0" 
                onPress={() => router.push('/frontend/artifacts/artifacts')}
              />
              
              <CategoryItem 
                icon={<MaterialCommunityIcons name="food" size={24} color="#2196F3" />} 
                label="Cuisines" 
                color="#E3F2FD" 
                onPress={() => router.push('/frontend/cuisines/cuisine')}
              />
            </View>

            {/* 5. Curated Trails Section */}
            <SectionHeader 
              title="Curated Trails" 
              onSeeMore={() => router.push('/frontend/curated_trails/trails')}
            />
            {loading ? (
              <ActivityIndicator size="large" color="#6DA047" style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {trails.map((trail) => (
                  <TrailCard 
                    key={trail.id} 
                    data={{
                      id: trail.id,
                      title: trail.title,
                      // Construct the subtitle dynamically
                      sub: `${trail.stop_count} Sites • ${trail.duration}`,
                      image:
                        trail.title === 'The Revolution Road'
                          ? 'https://eifomocplfshvfrympiu.supabase.co/storage/v1/object/public/KulturAR-assets/TRAILS/Revolution%20Road.jpg'
                          : trail.title === 'Heroes of Kawit'
                          ? 'https://eifomocplfshvfrympiu.supabase.co/storage/v1/object/public/KulturAR-assets/TRAILS/Emilio%20of%20Kawit.jpg'
                          : trail.title === 'Valor & Martyrs Trail'
                          ? 'https://eifomocplfshvfrympiu.supabase.co/storage/v1/object/public/KulturAR-assets/TRAILS/Martyrs.jpg'
                          : trail.title === 'The Old Churches Loop'
                          ? 'https://eifomocplfshvfrympiu.supabase.co/storage/v1/object/public/KulturAR-assets/TRAILS/Church.jpg'
                          : 'https://eifomocplfshvfrympiu.supabase.co/storage/v1/object/public/KulturAR-assets/TRAILS/Church.jpg',

                    }}
                    onPress={() => router.push(`/frontend/curated_trails/${trail.id}`)} 
                  />
                ))}
              </ScrollView>
            )}

            
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Components ---

const SearchResultsList = ({ results, onResultPress }) => (
  <ScrollView style={styles.searchResultsContainer}>
    {results.map((result) => (
      <TouchableOpacity
        key={`${result.type}-${result.id}`}
        style={styles.searchResultItem}
        onPress={() => onResultPress(result)}
      >
        <View>
          <Text style={styles.searchResultTitle}>{result.name}</Text>
          {result.city && <Text style={styles.searchResultCity}>{result.city}</Text>}
        </View>
        <Text style={styles.searchResultType}>{result.type}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const SectionHeader = ({ title, onSeeMore, style }) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onSeeMore}>
      <Text style={styles.seeAllText}>See All</Text>
    </TouchableOpacity>
  </View>
);

// UPDATED: Now accepts 'onPress'
const CategoryItem = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
    <View style={[styles.categoryIconBox, { backgroundColor: color }]}>
      {icon}
    </View>
    <Text style={styles.categoryLabel}>{label}</Text>
  </TouchableOpacity>
);

const TrailCard = ({ data, onPress }) => (
  <TouchableOpacity style={styles.trailCard} activeOpacity={0.9} onPress={onPress}>
    <Image source={{ uri: data.image }} style={styles.trailImage} resizeMode="cover" />
    <View style={styles.trailInfo}>
      <View>
        <Text style={styles.trailTitle}>{data.title}</Text>
        <Text style={styles.trailSub}>{data.sub}</Text>
      </View>
      <Ionicons name="arrow-forward-circle" size={32} color="#6DA047" />
    </View>
  </TouchableOpacity>
);