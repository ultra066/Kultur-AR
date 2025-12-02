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

  // === UPDATED INPUT STYLES ===
  
  // 1. The Container acts as the Box (Border, Background)
  // It is a ROW: [ TextWrapper (Flex 1) | Icon ]
  inputContainer: {
    width: '100%',
    backgroundColor: '#e8e6dc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0cec4',
    paddingVertical: 8,       // Vertical padding to give space top/bottom
    paddingHorizontal: 16,
    marginBottom: 16,         // Space between input blocks
    flexDirection: 'row',     // Arranges content side-by-side
    alignItems: 'center',
  },
  
  // 2. This wraps the Label and Input to stack them vertically
  inputTextWrapper: {
    flex: 1,                  // Takes all available space to the left of the icon
    flexDirection: 'column',  // Stacks Label on top of Input
    justifyContent: 'center',
  },

  inputLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,          // Small space between label and text
    textAlign: 'left',
  },
  
  input: {
    fontSize: 15,
    color: '#000',
    padding: 0,               // Remove padding so it fits snugly
    height: 20,               // Fixed small height for the text line
  },

  eyeIcon: {
    padding: 8,
    marginLeft: 4,            // Space between input text and icon
  },
  // ============================

  inputError: {
    borderColor: 'red',
    borderWidth: 1.5,
  },

  nextButton: {
    width: '100%',
    backgroundColor: '#b3cf5f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: '#d0d0d0',
    elevation: 0,
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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