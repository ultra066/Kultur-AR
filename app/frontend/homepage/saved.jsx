import React, { useState } from 'react';
import { View, Text, SectionList, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSavedItems } from '../components/SavedItemsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/database/supabase'; // Import supabase client for auth check
import SavedButton from '../components/savedButton/SavedButton'; // Import SavedButton

const TAB_OPTIONS = ['All', 'Sites', 'Cuisines', 'Artifacts', 'Curated_Trails'];

export default function SavedScreen() {
  const { savedItems, handleSave, isSaved, loading: loadingItems } = useSavedItems();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('All');
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check user authentication status
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingAuth(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loadingAuth || loadingItems) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6DA047" />
          <Text style={styles.loadingText}>Loading saved items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please log in to view your saved items.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/frontend/login_signup/index')}>
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allSavedItems = savedItems;

  const handleItemPress = (item) => {
    // Determine the correct path based on the item type
    let path = '';
    switch (item.type) {
      case 'sites':
        path = `/frontend/cultural_sites/${item.id}`;
        break;
      case 'cuisines':
        path = `/frontend/cuisines/${item.id}`;
        break;
      case 'artifacts':
        path = `/frontend/artifacts/${item.id}`;
        break;
      case 'festivals': // Assuming 'festivals' will have a similar path structure
        path = `/frontend/festivals/${item.id}`;
        break;
      case 'curated_trails':
        path = `/frontend/curated_trails/${item.id}`;
        break;
      default:
        // Optional: handle default case or unsupported types
        console.warn(`Unsupported item type: ${item.type}`);
        return;
    }
    router.push(path);
  };

  const filteredItems = selectedTab === 'All'
    ? allSavedItems
    : allSavedItems.filter(item => {
        const itemType = item.type.toLowerCase().replace(/_/g, ' '); // Normalize item type for comparison
        const selected = selectedTab.toLowerCase().replace(/_/g, ' '); // Normalize selected tab for comparison
        return itemType === selected;
      });

  const groupedItems = filteredItems.reduce((acc, item) => {
    // Use a consistent type format (e.g., capitalize first letter and handle spaces)
    const typeKey = item.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    if (!acc[typeKey]) {
      acc[typeKey] = [];
    }
    acc[typeKey].push(item);
    return acc;
  }, {});

  const sections = Object.keys(groupedItems).map(type => ({
    title: type,
    data: groupedItems[type],
  }));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardContentWrapper} onPress={() => handleItemPress(item)}>
        <Image source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'No description available.'}
          </Text>
        </View>
      </TouchableOpacity>
      <SavedButton
        isSaved={isSaved(item.id, item.type)}
        onToggleSave={() => handleSave(item)}
      />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => {
    const formattedTitle = title.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return <Text style={styles.sectionHeader}>{formattedTitle}</Text>;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Saved Items</Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TAB_OPTIONS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.selectedTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
                {tab.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved items in this category.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F5', // Off-white background
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  selectedTab: {
    backgroundColor: '#6DA047', // Primary green color
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center', // Align items vertically in the card
  },
  cardContentWrapper: {
    flexDirection: 'row',
    flex: 1, // Allow content to take up available space
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#EEE',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#6DA047',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

