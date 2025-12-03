import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Make sure this file exists in the same folder!
import { styles } from './home_styles';

// Sample Data for Trails
const trailsData = [
  {
    id: '1',
    title: 'The Revolution Trail',
    sub: '5 Sites • 2 Hours',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Bonifacio_Trial_House.jpg',
  },
  {
    id: '2',
    title: 'Heroes of Kawit',
    sub: '3 Sites • 1.5 Hours',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Aguinaldo_Shrine_Facade.jpg/1200px-Aguinaldo_Shrine_Facade.jpg',
  },
  {
    id: '3',
    title: 'Coastal Heritage',
    sub: '4 Sites • 3 Hours',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Zapote_Bridge_%28Bacoor_side%29.JPG/640px-Zapote_Bridge_%28Bacoor_side%29.JPG',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Dark Status Bar for Dark Theme */}
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Greeting */}
        <View style={styles.headerContainer}>
          <Text style={styles.greetingSub}>Mabuhay,</Text>
          <Text style={styles.greetingTitle}>Ka-Kultura!</Text>
        </View>

        {/* 2. Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search sites, festivals, history..." 
            style={styles.searchInput} 
            placeholderTextColor="#888"
          />
        </View>

        {/* 3. Map Guide Banner */}
        <TouchableOpacity 
          style={styles.mapBannerContainer} 
          onPress={() => router.push('/frontend/homepage/map')}
        >
          {/* Use a real map image here */}
          <Image 
            source={{ uri: 'https://img.freepik.com/free-vector/city-map-background-concept_23-2148006429.jpg' }} 
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
            onPress={() => console.log("Festivals Clicked")}
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
          onSeeMore={() => router.push('/frontend/curated_trails/trails')} // <--- THE FIX
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {trailsData.map((trail) => (
            <TrailCard key={trail.id} data={trail} />
          ))}
        </ScrollView>

        {/* 6. Featured Today Section */}
        <SectionHeader title="Featured Today" onSeeMore={() => {}} style={{marginTop: 10}} />
        <TouchableOpacity style={[styles.trailCard, { width: '90%', alignSelf: 'center' }]}>
           <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Saint_Mary_Magdalene_Parish_Church_of_Kawit_-_Facade_%28Kawit%2C_Cavite%3B_04-23-2023%29.jpg' }} 
              style={styles.trailImage} 
            />
            <View style={styles.trailInfo}>
              <View>
                <Text style={styles.trailTitle}>St. Mary Magdalene Church</Text>
                <Text style={styles.trailSub}>Kawit, Cavite</Text>
              </View>
              <Ionicons name="heart-circle" size={32} color="#E91E63" />
            </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Components ---

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

const TrailCard = ({ data }) => (
  <TouchableOpacity style={styles.trailCard} activeOpacity={0.9}>
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