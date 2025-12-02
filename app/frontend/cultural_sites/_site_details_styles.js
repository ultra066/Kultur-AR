import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0E9', // Cream background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F0E9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  // --- Header Image & Back Button ---
  imageContainer: {
    height: height * 0.4, // Takes up 40% of the screen height
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent black
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // --- Content Section ---
  contentContainer: {
    flex: 1,
    backgroundColor: '#F2F0E9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Overlap the image slightly
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },

  // --- Action Buttons ---
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed for better spacing with smaller buttons
    marginBottom: 25,
  },
  actionButton: {
    width: (width - 90) / 2, // Make buttons smaller
    aspectRatio: 1,
    backgroundColor: '#E8E6DD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative', // Required for absolute positioning of corners
  },

  // --- Corner Borders for Action Buttons ---
  corner: {
    position: 'absolute',
    width: '35%',
    height: '35%',
    borderColor: '#355E3B', // Outline color
    borderWidth: 0,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 20,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  actionSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // --- Get Directions Button ---
  directionsButton: {
    backgroundColor: '#355E3B', // Hunter Green
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#355E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  directionsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default styles;

//