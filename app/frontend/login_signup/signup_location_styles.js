import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6da047',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  headerContainer: {
    height: height * 0.15,
    backgroundColor: '#6da047',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#f2f0e9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    padding: 10,
  },
  backArrowText: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },

  // === SELECTION BOX (The big beige box) ===
  selectionBox: {
    width: '100%',
    backgroundColor: '#efefe6', // Slightly darker beige/grey
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 20,
    marginBottom: 20,
  },
  selectionLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  
  // Radio Button Row
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  radioText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  
  // The Circle UI
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6da047', // Green highlight
  },

  // === DROPDOWN / INPUT STYLES ===
  dropdownContainer: {
    width: '100%',
    backgroundColor: '#efefe6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes arrow to right
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#555',
  },

  // === BUTTONS ===
  mainButton: {
    width: '100%',
    backgroundColor: '#aed555', // Gradient-like green
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20, // Space from inputs
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#9bc24b',
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
  
  footerLink: {
    marginTop: 'auto',
    alignSelf: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
});

export default styles;