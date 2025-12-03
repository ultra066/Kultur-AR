import React, { useState } from 'react';
import { View, Text, SectionList, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSavedItems } from '../components/SavedItemsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const TAB_OPTIONS = ['All', 'Sites', 'Cuisines', 'Artifacts'];

export default function SavedScreen() {
  const { savedItems } = useSavedItems();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('All');

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
      default:
        // Optional: handle default case or unsupported types
        console.warn(`Unsupported item type: ${item.type}`);
        return;
    }
    router.push(path);
  };

  const filteredItems = selectedTab === 'All' 
    ? savedItems 
    : savedItems.filter(item => item.type.toLowerCase() === selectedTab.toLowerCase());

  const groupedItems = filteredItems.reduce((acc, item) => {
    // Use a consistent type format (e.g., capitalize first letter)
    const type = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  const sections = Object.keys(groupedItems).map(type => ({
    title: type,
    data: groupedItems[type],
  }));

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleItemPress(item)}>
      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'No description available.'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
  
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
                {tab}
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
});
