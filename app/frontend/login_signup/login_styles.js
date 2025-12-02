import { StyleSheet, Dimensions } from 'react-native';

// 1. Get the screen height to calculate exact sizes
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6da047',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height, // Ensures the view always fills the full screen height
  },
  headerContainer: {
    height: height * 0.28, // Use calculated pixels
    backgroundColor: '#6da047',
  },
  cardContainer: {
    flex: 1, 
    backgroundColor: '#f2f0e9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center', // Centers both lines
    lineHeight: 38,      // Adds space between the top and bottom line
  },
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
  signInButton: {
    width: '100%',
    backgroundColor: '#b3cf5f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  optionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#888',
  },
  optionsText: {
    fontSize: 13,
    color: '#555',
  },
  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#888',
  },
  socialButtonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  socialButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d0cec4',
    flexDirection: 'row',
  },
  socialIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIconText: {
    fontSize: 18,
    marginRight: 8,
  },
  socialIconFacebook: {
    color: '#1877F2',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  createAccountButton: {
    marginTop: 'auto',
    padding: 10,
  },
  createAccountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
});

export default styles;