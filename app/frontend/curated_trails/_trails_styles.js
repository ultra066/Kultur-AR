import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F5', // Light cream/off-white background from image
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // === HEADER ===
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },

  // === SEARCH & FILTER ROW ===
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light gray for search box
    borderRadius: 25, // Pill shape
    paddingHorizontal: 15,
    height: 50,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },

  // === TRAIL CARD ===
  cardContainer: {
    height: 220, // Tall card
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#ccc',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  // Dark Gradient/Overlay at the bottom
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Covers bottom half
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent black
  },
  
  // Card Content
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    color: '#e0e0e0',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Floating Explore Button inside Card
  exploreButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F0E4', // Creamy color from your theme
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  exploreLabel: {
    position: 'absolute',
    bottom: -20,
    right: 22,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  }
});

export default styles;