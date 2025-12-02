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
    justifyContent: 'center', // Center the single button
    marginBottom: 25,
  },
  actionButton: {
    minWidth: (width - 90) / 2, // Keep a decent size
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#E8E6DD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default styles;