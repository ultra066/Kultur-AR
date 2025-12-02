import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6da047',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    height: '15%',
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
  // Back Arrow
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

  // === INPUT STYLES (MATCHING LOGIN) ===
  inputContainer: {
    width: '100%',
    backgroundColor: '#e8e6dc',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d0cec4',
  },
  inputLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    color: '#000',
    padding: 0,
  },

  // === NEXT BUTTON (UPDATED TO MATCH SIGN IN BUTTON) ===
  nextButton: {
    width: '100%',
    backgroundColor: '#b3cf5f', // Matches "Sign In" color
    borderRadius: 12,
    paddingVertical: 14,      // Matches "Sign In" padding
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,       // Matches "Sign In" shadow
    shadowRadius: 4,
    elevation: 3,             // Matches "Sign In" elevation
  },
  // ====================================================

  nextButtonDisabled: {
    backgroundColor: '#d0d0d0',
    elevation: 0,
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 18, // Kept slightly larger for "Next", or change to 16 to match exactly
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
  helperText: {
    fontSize: 13,
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 4, // Align slightly with the input box edge
  },
  // === MODAL / BOTTOM SHEET STYLES ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Darkens the background
    justifyContent: 'flex-end', // Pushes content to the bottom
  },
  modalContent: {
    backgroundColor: '#f2f0e9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: '60%', // Occupies bottom half of screen
    alignItems: 'center',
  },
  modalHandle: {
    width: 60,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 30, // Space between handle and Title
  },
  otpInputContainer: {
    width: '100%',
    backgroundColor: '#e8e6dc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0cec4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
    letterSpacing: 2, // Spacing for OTP codes looks better
  },
  timerText: {
    fontSize: 14,
    color: '#000',
    marginTop: 20,
    marginBottom: 20,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  retryText: {
    color: '#007BFF', // Blue link color
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default styles;