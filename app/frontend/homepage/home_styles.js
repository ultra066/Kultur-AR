import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
// Width for horizontal cards (Trails)
const TRAIL_CARD_WIDTH = width * 0.7; 

export const styles = StyleSheet.create({
  // === MAIN CONTAINER (DARK MODE) ===
  safeArea: {
    flex: 1,
    backgroundColor: '#EFEFE5', // Dark background
  },
  scrollContainer: {
    paddingBottom: 100, // Space for bottom nav
  },
  
  // === HEADER ===
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  greetingSub: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
  },

  // === SEARCH BAR ===
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearIcon: {
    marginLeft: 10,
  },

  // === MAP GUIDE BANNER ===
  mapBannerContainer: {
    marginHorizontal: 20,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 30,
    marginTop: 25,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6, // Dim the image
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mapTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    width: '60%',
  },
  mapSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
    width: '60%',
  },
  mapButton: {
    backgroundColor: '#6DA047', // Green
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // === CATEGORY GRID ===
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryItem: {
    alignItems: 'center',
    width: width / 4 - 15,
  },
  categoryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },

  // === SECTIONS (Trails/Featured) ===
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6DA047', // Green
    fontWeight: '600',
  },

  // Horizontal Scroll List
  horizontalList: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  
  // Trail Card Style
  trailCard: {
    width: TRAIL_CARD_WIDTH,
    height: TRAIL_CARD_WIDTH * 0.6, // Landscape aspect
    backgroundColor: '#1E1E1E', // Dark card background
    borderRadius: 16,
    marginRight: 15,
    overflow: 'hidden',
  },
  trailImage: {
    width: '100%',
    height: '65%',
  },
  trailInfo: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  trailSub: {
    fontSize: 12,
    color: '#888',
  },
  // === SEARCH RESULTS ===
  searchResultsContainer: {
    paddingHorizontal: 20,
  },
  searchResultItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  searchResultType: {
    fontSize: 14,
    color: '#888',
  },
  searchResultCity: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default styles;